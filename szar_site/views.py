"""RSVP Views"""
from django.shortcuts import render
from rsvp.view_helpers import rsvps_get_attending_raw
from django.contrib.auth.models import User

def home(request, username=None):
    context = {}
    if User.objects.filter(username=username).exists():
        context["attendees"] = rsvps_get_attending_raw()
        context["url_username"] = username
    else:
        context["allow_robots"] = True
    return render(request, 'site/home.html', context)
