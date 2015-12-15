"""RSVP Views"""
from django.shortcuts import render

def invitation(request):
    return render(request, 'rsvp/invitation.html', {})