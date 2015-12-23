from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^$', views.invitation, name='invitation'),
    url(r'rsvps$', views.rsvps, name='save_rsvp'),
    url(r'rsvps/(?P<rsvp_id>\d+)$', views.rsvps),
]