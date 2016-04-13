from django.conf.urls import url
from . import views, views_guest

urlpatterns = [
    url(r'^$', views.invitation, name='invitation'),
    url(r'^rsvps$', views.rsvps, name='save_rsvp'),
    url(r'^rsvps/(?P<rsvp_id>[a-zA-Z0-9]+)$', views.rsvps),
    url(r'^guests$', views_guest.add_guests, name='add_guests'),
    url(r'^guests/(?P<email_type>[a-zA-Z]+)$', views_guest.email),
    url(r'^change_number$', views_guest.change_number, name='change_number'),
    url(r'^change_number/(?P<username>[a-zA-Z0-9]+)/(?P<new_number>[0-9\.]+)$', views_guest.change_number),
    url(r'^(?P<username>[a-zA-Z0-9]+)$', views.quick_actions, name='make_rsvp'),
    url(r'^(?P<username>[a-zA-Z0-9]+)/(?P<action>[a-zA-Z]+)$', views.quick_actions, name='quick_actions'),
]
