"""RSVP Views"""
from django.shortcuts import render
from rsvp.view_helpers import rsvps_get_attending_raw

import keen

from rsvp.view_helpers import KEEN_OBJECT

def home(request, username=None):
    keen.add_event("visit_home_page", KEEN_OBJECT)
    context = {}
    if username:
        context["attendees"] = rsvps_get_attending_raw()
        context["url_username"] = username
    else:
        context["allow_robots"] = True
    return render(request, 'site/home.html', context)
