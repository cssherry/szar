from django.conf.urls import url
from . import views, views_guest

urlpatterns = [
    url(r'^$', views.invitation, name='invitation'),
    url(r'rsvps$', views.rsvps, name='save_rsvp'),
    url(r'rsvps/(?P<rsvp_id>\d+)$', views.rsvps),
    url(r'attending$', views.attending, name='attending'),
    url(r'guests$', views_guest.add_guests, name='add_guests'),
]