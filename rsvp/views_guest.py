"""RSVP Views"""
import json

from django.views.decorators.csrf import ensure_csrf_cookie

from django.http import HttpResponse
from django.contrib.auth.decorators import login_required

from django.contrib.auth.models import User

from rsvp.utils import create_random_string

from django.shortcuts import render

import keen

from rsvp.view_helpers import send_emails, get_email, KEEN_OBJECT, rsvps_get_raw

from rsvp.models import RSVP

import django_excel
import pyexcel.ext.xls
import pyexcel.ext.xlsx

@login_required
# Need to set cookie for IE people or they won't be able to submit forms
@ensure_csrf_cookie
def email(request, email_type=""):
    subjects = {
        'invitation': 'Wedding Invitation August 27-28 (Response Requested)',
        'logistics': 'Sherry and Aneesh Wedding Logistics (Respond by August 1st)'
    }
    subject = subjects.get(email_type, "Sherry and Aneesh Wedding Information")
    if request.user.is_superuser:
        if request.method == 'GET':
            return get_email(request, email_type)
        elif request.method == 'POST':
            return send_emails(request, email_type, subject)
    else:
        keen.add_event("admin_send_email_illegal", KEEN_OBJECT)
        return HttpResponse("Only admin can view or send emails", status=500)

def get_rsvps(request):
    ctx = {
        "current_guests": json.loads(rsvps_get_raw(None))
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

@login_required
# Need to set cookie for IE people or they won't be able to submit forms
@ensure_csrf_cookie
def change_number(request, username="", new_number=""):
    if request.user.is_superuser:
        if request.method == 'POST':
            user = User.objects.filter(username=username)
            if user.exists():
                user[0].rsvp.edit({
                    "expected_attendees": float(new_number),
                })
                return HttpResponse("Success", status=200)
            else:
                return HttpResponse("No such user found", status=500)

    else:
        keen.add_event("admin_check_rsvps_illegal", KEEN_OBJECT)
        return HttpResponse("Only admin can change attendees", status=500)
