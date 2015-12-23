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

from django.conf import settings
from django.shortcuts import redirect, render

def invitation(request):
    return render(request, 'rsvp/invitation.html', {})

def _rsvps_get_raw(rsvp_id):
  if rsvp_id:
      rsvps = RSVP.objects.filter(id=rsvp_id)
  else:
      rsvps = RSVP.objects.all()
  outl = []
  for r in rsvps:
      rsvps = {
        'guest': r.guest,
        'attending': r.attending,
        'vegetarian': r.vegetarian,
        'other_dietary_restrictions': r.other_dietary_restrictions,
        'attending_dates': r.attending_dates,
        'need_carpool_info': r.need_carpool_info,
        'need_hotel_info': r.need_hotel_info,
        'plus_one': r.plus_one,
        'plus_one_name': r.plus_one_name,
        'song_requests': r.song_requests,
        'created_date': r.created_date,
        'edited_date': r.edited_date,
      }
      outl.append(user)

  return outl

def _rsvps_create(request, new_user):
    form_entries = json.loads(request.POST.get("formEntries"))
    if new_user:
        username = create_random_string()
        first_name = form_entries["first_name"]
        last_name = form_entries["last_name"]
        emailaddress = form_entries["emailaddress"]
        if not emailaddress:
            emailaddress = "none"
        user = User.objects.create_user(username, emailaddress, "szar")
        user.last_name = last_name
        user.first_name = first_name
        user.save()
    else:
        user = request.user
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
