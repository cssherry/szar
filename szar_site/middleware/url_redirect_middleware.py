import re

from django.http import HttpResponsePermanentRedirect

class UrlRedirectMiddleware:
    """
    This middleware redirects away from heroku site to custom domain
    """
    def process_request(self, request):
        if 'szarwed.herokuapp.com' == request.META['HTTP_HOST']:
            return HttpResponsePermanentRedirect('https://www.szar.us')
