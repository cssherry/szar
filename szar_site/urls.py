"""szar_site URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Import the include() function: from django.conf.urls import url, include
    3. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
"""
from django.conf.urls import include, url
from django.contrib import admin
from . import views
from django.views.generic import TemplateView, RedirectView
from django.conf import settings

urlpatterns = [
    # Set default accounts/login page -- just going to use django admin login for now
    # http://stackoverflow.com/questions/20480177/what-more-do-i-need-to-do-to-have-djangos-login-required-decorator-work#comment37075291_20480226
    url(r'^accounts/login/$', 'django.contrib.auth.views.login', {'template_name': 'admin/login.html'},name="my_login"),
    url(r'^robots\.txt$', TemplateView.as_view(template_name='robots.txt', content_type='text/plain')),
    url(r'^google7a6f5afec5a29ae0.html$', TemplateView.as_view(template_name='ext_google7a6f5afec5a29ae0.html')),
    url(r'^favicon\.ico$', RedirectView.as_view(url=settings.STATIC_URL + 'images/favicon.ico')),
    url(r'^szaradmin/', include(admin.site.urls)),
    url(r'^$', views.home, name='root-url'),
    url(r'^rsvp/', include('rsvp.urls')),
    url(r'^(?P<username>[a-zA-Z0-9]+)$', views.home, name='custom-root-url'),
]
