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

from rsvp.views import KEEN_OBJECT

from django.core.mail import EmailMultiAlternatives

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
    return render(request, 'rsvp/invitation.html', {})

def add_rsvps(request):
    return HttpResponse("Success", status=200)

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
