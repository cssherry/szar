"""RSVP Views"""
from django.shortcuts import render

import keen

from rsvp.views import KEEN_OBJECT

def home(request):
    keen.add_event("visit_home_page", KEEN_OBJECT)
    return render(request, 'site/home.html', {})
