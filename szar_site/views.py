"""RSVP Views"""
from django.shortcuts import render

def home(request):
    return render(request, 'site/home.html', {})
