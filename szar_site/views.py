"""RSVP Views"""
from django.shortcuts import render
from django.core.files import File
import os

import keen

from rsvp.views import KEEN_OBJECT

def home(request):
    keen.add_event("visit_home_page", KEEN_OBJECT)
    with open(os.path.dirname(__file__) + '/wanderable.txt', 'r') as myfile:
        data = "".join(line.rstrip() for line in myfile)
    return render(request, 'site/home.html', {
        "wanderable": data
    })
