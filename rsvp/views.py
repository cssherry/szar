"""RSVP Views"""
import os, sys, json

from django.http import HttpResponse, HttpResponseRedirect, QueryDict
from django.template import RequestContext, loader
from django.contrib.auth import authenticate, login, logout
from django.core.context_processors import csrf
from django.contrib.auth.decorators import login_required

from django.contrib.auth.models import User
from rsvp.models import RSVP

from rsvp.utils import create_random_string
from django.core import serializers

from django.conf import settings
from django.shortcuts import redirect, render

def invitation(request):
    return render(request, 'rsvp/invitation.html', {})

def _rsvps_get_raw(rsvp_id):
    rsvps_array = RSVP.objects.all()
    if rsvp_id:
        rsvps_array = RSVP.objects.filter(id=rsvp_id)

    return serializers.serialize('json', rsvps_array)

def _rsvps_create(request, new_user):
    form_entries = json.loads(request.POST.get("formEntries"))
    rsvp_values = {}
    user_values = {"first_name": True, "last_name": True, "email": "", "password": "szar"}
    for k, v in form_entries.items():
        if v == "False":
            v = False
        if not v == "":
            try:
                user_values[k]
                user_values[k] = v
            except:
                rsvp_values[k] = v
    if new_user:
        user_values["username"] = create_random_string()
        user = User.objects.create_user(**user_values)
    else:
        user = request.user
    user.rsvp = RSVP(**rsvp_values)
    user.rsvp.save()
    return HttpResponse("Success", status=200)

def rsvps(request, rsvp_id=''):
    if request.method == 'GET':
        if request.user.is_superuser:
            rsvps_formatted = json.dumps(_rsvps_get_raw(rsvp_id))
            return HttpResponse(rsvps_formatted, content_type="application/json")
        else:
            return HttpResponse("Only admin can see rsvps", status=500)

    if request.method == 'POST':
        return _rsvps_create(request, True)

    # if request.method == 'PUT':
    #     return _rsvps_update(request, rsvp_id)
    #
    # if request.method == 'DELETE':
    #     return _rsvps_delete(request, rsvp_id)
