"""RSVP Views"""
import os, sys, json

from django.views.decorators.csrf import ensure_csrf_cookie

from django.core.urlresolvers import reverse

from django.http import HttpResponse, HttpResponseRedirect, QueryDict
from django.template import RequestContext, Context, loader
from django.contrib.auth import authenticate, login, logout
from django.core.context_processors import csrf
from django.contrib.auth.decorators import login_required

from django.contrib.auth.models import User
from rsvp.models import RSVP

from rsvp.utils import create_random_string
from django.core import serializers

from django.conf import settings
from django.shortcuts import redirect, render

import keen

from rsvp.views import KEEN_OBJECT, _rsvps_get_raw, create_random_string

from django.core.mail import EmailMultiAlternatives

from rsvp.models import RSVP

import django_excel
import pyexcel.ext.xls
import pyexcel.ext.xlsx

@login_required
def email(request, email_type=""):
     if request.user.is_superuser:
        if request.method == 'GET':
            return get_email(request, email_type)
        elif request.method == 'POST':
            return send_emails(request, email_type)
     else:
        keen.add_event("admin_send_email_illegal", KEEN_OBJECT)
        return HttpResponse("Only admin can view or send emails", status=500)

def send_emails(request, email_type):
    rsvp_ids = json.loads(request.POST.get("selection"))
    response_message = ""
    for rsvp_id in rsvp_ids:
        rsvp = RSVP.objects.filter(id=rsvp_id)
        if len(rsvp) > 0:
            if rsvp[0].guest and rsvp[0].guest.email.find("@") != -1:
                rsvp = rsvp[0]
                send_email(request, email_type, rsvp)
                response_message += "Successfully sent for " + rsvp_id + "."
            else:
                response_message += "No user or email for " + rsvp_id + "."
        else:
            response_message += "No rsvp for " + rsvp_id + "."

    return HttpResponse(response_message, status=200)

def send_email(request, email_type, rsvp):
    name, username, rsvp_email, full_name = rsvp.name(), rsvp.guest.username, rsvp.guest.email, rsvp.full_name()

    ctx = {
        "name": name,
        "rsvp_link": request.build_absolute_uri(reverse('make_rsvp', args=(username,))),
        "no_link": request.build_absolute_uri(reverse('quick_actions', args=(username, "no", ))),
        "unsubscribe": request.build_absolute_uri(reverse('quick_actions', args=(username, "unsubscribe", ))),
        "homepage": request.build_absolute_uri(reverse('root-url'))
    }
    html_content = loader.get_template("email/" + email_type + ".html").render(ctx);
    text_content = loader.render_to_string('email/' + email_type + '.txt', ctx);
    subject, my_email = 'Wedding Invitation August 27-28 (RSVP by July 1st)', 'Sherry Zhou <xiao.qiao.zhou+wedding@gmail.com>'
    msg = EmailMultiAlternatives(subject, text_content, my_email, ['{0} <{1}>'.format(full_name, rsvp_email)])
    msg.attach_alternative(html_content, "text/html")
    msg.send();

def get_email(request, email_type):
    pretendCtx = {
        "name": "Sherry",
        "rsvp_link": request.build_absolute_uri(reverse('make_rsvp', args=[1])),
        "no_link": request.build_absolute_uri(reverse('quick_actions', args=(1, "no", ))),
        "unsubscribe": request.build_absolute_uri(reverse('quick_actions', args=(1, "unsubscribe", ))),
        "homepage": request.build_absolute_uri(reverse('root-url'))
    }
    return render(request, 'email/' + email_type + '.html', pretendCtx)

def get_rsvps(request):
    ctx = {
        "current_guests": json.loads(_rsvps_get_raw(None))
    }
    return render(request, 'rsvp/add_guests.html', ctx)

def add_rsvps(request):
    results = request.FILES['file'].get_array(sheet_name=None, name_columns_by_row=0)
    dictionary = {}
    for idx, row in enumerate(results):
        if idx == 0:
            for col_idx, column_name in enumerate(row):
                dictionary[column_name] = col_idx
        else:
            new_row = _special_initialize(row, dictionary)
            user_values = {
                "first_name": new_row[dictionary["First Name"]],
                "last_name": new_row[dictionary["Last Name"]],
                "email": new_row[dictionary["Email Address"]],
                "password": "szar"
            }
            rsvp_values = {
                "plus_one": new_row[dictionary["Plus One"]],
                "formal_prefix": new_row[dictionary["Formal"]],
                "affiliation": new_row[dictionary["Affiliation"]],
                "expected_attendees": new_row[dictionary["RSVP"]],
            }
            user = User.objects.filter(first_name=user_values["first_name"], last_name=user_values["last_name"])
            if user.exists():
                user = User.objects.get(first_name=user_values["first_name"], last_name=user_values["last_name"])
                user.email = user_values["email"]
                user.save()
            else:
                user_values["username"] = create_random_string()
                user = User.objects.create_user(**user_values)

            try:
                user.rsvp.edit(rsvp_values)
            except:
                user.rsvp = RSVP(**rsvp_values)
                user.rsvp.save()

    return HttpResponse("Success", status=200)

def _special_initialize(row, dictionary):
    plus_one_idx = dictionary["Plus One"]
    if row[plus_one_idx] == "no":
        row[plus_one_idx] = False
    else:
        row[plus_one_idx] = True

    rsvp_idx = dictionary["RSVP"]
    if row[rsvp_idx] == "Wait":
        row[rsvp_idx] = 0

    return row

@login_required
# Need to set cookie for IE people or they won't be able to submit forms
@ensure_csrf_cookie
def add_guests(request):
    if request.user.is_superuser:
        if request.method == 'GET':
            return get_rsvps(request)
        elif request.method == 'POST':
            return add_rsvps(request)
    else:
        keen.add_event("admin_check_rsvps_illegal", KEEN_OBJECT)
        return HttpResponse("Only admin can see rsvps", status=500)
