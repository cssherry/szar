"""RSVP Views"""
import os, sys, json

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

def send_email(user, email_link, title):
    ctx = Context({
        "first_name": "Sherry",
        "last_name": "Zhou",
        "rsvp_link": "test",
        "no_link": "test",
        "unsubscribe": "unsubscribe"
    })
    html_content = loader.get_template("email/invitation.html").render(ctx);
    text_content = loader.render_to_string('email/invitation.txt', ctx);
    subject, my_email = 'Wedding Invitation Template', 'Sherry Zhou <xiao.qiao.zhou+wedding@gmail.com>'
    msg = EmailMultiAlternatives(subject, text_content, my_email, [my_email])
    msg.attach_alternative(html_content, "text/html")
    msg.send();

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
                user.rsvp.update(**rsvp_values)
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
def add_guests(request):
    if request.user.is_superuser:
        if request.method == 'GET':
            return get_rsvps(request)
        elif request.method == 'POST':
            return add_rsvps(request)
    else:
        keen.add_event("admin_check_rsvps_illegal", KEEN_OBJECT)
        return HttpResponse("Only admin can see rsvps", status=500)
