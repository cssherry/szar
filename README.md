# To do
  - [x] Implement https://modernizr.com/ (IE/mobile dreariness)
    - [ ] mobile site
    - [ ] Low priority: Swip action
  - [x] Debug stupid font (damn you Italianno, stop being comic sans!)
  - [x] Enable excel/csv file upload of wedding guests
    - [x] Ideally, allow drag/drop, but low priority
    - [x] Update list whenever users/rsvps updated
    - [ ] Have backup in case dropzonejs fails (use input)
    - [ ] Upload outside rsvps (for relatives with physical invitations)
  - [x] Enable emailing of invitations
    - [x] Allow confirmation of rsvp and updateable forms
    - [x] Allow form updating with memory of previous entries
    - [x] Add quick unsubscribe and quick rsvp no
    - [x] sort away maybes
    - [x] Record emails sent
    - [ ] Send RSVP confirmation
    - [ ] Allow change of "expected attendees" number
    - [ ] Add keen recording of errors
    - [ ] Analytics graphs
    - [ ] RSVP graphs
    - [x] Admin management of emails
  - [x] Create typical wedding pages:
    - [x] Improve styling
    - [x] Logistics:
      - [x] Venue
      - [x] schedule
      - [ ] ceremony primer
      - [ ] hotels
      - [ ] travel
      - [ ] countdown?
    - [X] Honeyfund/donate options
    - [x] Bio/Meeting/Engagement/Pictures
  - [ ] Photos page:
    - [x] Engagement photos
    - [ ] Facebook
    - [ ] Instagram
    - [ ] text
    - [ ] Twitter

# First time
  * Create virtual environment
  * Activate virtual environment with ```. ENV_NAME/bin/activate```
  * Install requirements  ```pip install -r requirements.txt```
  * ```python manage.py migrate --settings=szar_site.settings```

# To run
  * Activate virtual environment with ```. ENV_NAME/bin/activate```
  * ``python manage.py runserver --settings=szar_site.settings```

# Technologies
  * Visuals:
    * Fancy css/svg animations inspired by http://codepen.io/jamestowers/pen/dhDbn
    * Tons of SVG graphics, background converted by http://dopiaza.org/tools/datauri/index.php after optimizing here https://petercollingridge.appspot.com/svg-editor
    * Chinese font explanation: http://www.kendraschaefer.com/2012/06/chinese-standard-web-fonts-the-ultimate-guide-to-css-font-family-declarations-for-web-design-in-simplified-chinese/
    * SVG Frame, can't remember where it was originally from, but available here: https://openclipart.org/detail/176385/decorative-frame-1
    * Font: self hosted with https://google-webfonts-helper.herokuapp.com/fonts/italianno template css. Alternative is https://github.com/neverpanic/google-font-download. Stack fonts so there's always something you like (http://webdesign.about.com/od/fonts/qt/web-safe-fonts.htm)
    * Custom Bootstrap for main page (http://getbootstrap.com/customize/?id=7825818c7b9d02fd87627bd92b48cbcf, see config.json), invitation page too fragile to accomodate bootstrap formatting
      * http://bootstrap-live-customizer.com/ to try out variables (see variables.less), http://bootswatch.com/ (too uncustomizable), or http://bootswatchr.com/gallery (too hard to update). Less CSS is amazing!
    * Picture optimization (https://varvy.com/pagespeed/defer-images.html and http://stackoverflow.com/questions/27934548/load-a-low-res-background-image-first-then-a-high-res-one):
      * -Lazy load by first loading base64 images (https://www.base64-image.de/)-
      * Actually, data uri isn't great on webpage (https://css-tricks.com/data-uris/), instead, create thumbnails using http://birme.net/. Lazyload has to use imagesLoaded (https://github.com/desandro/imagesloaded) to detect load event because loading from cache doesn't trigger it (http://stackoverflow.com/a/3877079/4607533)
      * Compress high res pictures (http://optimizilla.com/)
    * Display carousel (I know, I know): http://www.w3schools.com/bootstrap/bootstrap_carousel.asp
    * Browser compatibility:
      * Common issues can be fixed here: https://developer.microsoft.com/en-us/microsoft-edge/tools/staticscan.
        * Lots of forgotten prefixes (https://developer.mozilla.org/en-US/docs/Glossary/Vendor_Prefix):
          ```
          Order:
          -webkit- (Chrome, newer versions of Opera.)
          -moz- (Firefox)
          -o- (Old versions of Opera)
          -ms- (Internet Explorer)
          ```
        * Switch to viewport size in invitation: https://css-tricks.com/viewport-sized-typography/
        * Prerender pages (~1 link): https://msdn.microsoft.com/library/dn265039(v=vs.85).aspx
        * Prefetch images and other large files (~10 links)
        * Make slightly more accessible (https://dev.opera.com/articles/introduction-to-wai-aria/)
      * modernizr for testing when nothing compatible (e.g. webkit features)
      * Stupid IE has issues for csrf tokens -- they need to be in the cookie and Django doesn't necessarily automatically set csrf cookies. Force with @ensure_csrf_cookie (See warning of https://docs.djangoproject.com/en/1.9/ref/csrf/)

  * Excel/CSV upload:
    * Django-excel: https://github.com/pyexcel/django-excel, docs at http://django-excel.readthedocs.org/en/latest/
      * Benefits: recently updated, accepts multiple formats
      * Downsides -- the nice function save_to_database() doesn't work if you're not using every single column. Very difficult problem to debug....
      * Alternatives: Django Data Importer (http://django-data-importer.readthedocs.org/en/latest/readme.html), js-xlsx (https://github.com/SheetJS/js-xlsx)
      * Note -- need to save as Windows csv for csv upload to work, otherwise, get error:

        ```
        new-line character seen in unquoted field - do you need to open the file in universal-newline mode?
        [03/Apr/2016 05:10:56] "POST /rsvp/guests HTTP/1.1" 500 16451

        ```

    * Dropzone.js for nice file upload interface: http://www.dropzonejs.com/

  * Django email: https://docs.djangoproject.com/en/1.9/topics/email/
    * Quick-start info: http://www.mangooranges.com/2008/09/15/sending-email-via-gmail-in-django/
    * Text and HTML template support: http://stackoverflow.com/questions/2809547/creating-email-templates-with-django
    * Responsive email template: https://github.com/leemunroe/responsive-html-email-template
    * Needs full urls, to get them, use request.build_absolute_uri(reverse('view_name', args)) as suggested here: https://docs.djangoproject.com/ja/1.9/ref/urlresolvers/
    * Minify html and make css inline for it to show up properly in email: http://foundation.zurb.com/emails/inliner-v2.html. Afterwards, remember to remove extra "amp;" in body of email wherever an "&" character was used

  * Prevent Heroku spindown
    * Use https://www.statuscake.com (alternative to pingdom) to test homepage and rsvp page every hour

  * Embed Wanderable into website
    * Address No 'Access-Control-Allow-Origin' header by using http://anyorigin.com/get?url=
    * Alternative was to use iframe, but ugly scrollbar placements, page padding, redirects (redirect can be prevented using ```<iframe class="hidden" src="URL" sandbox="allow-forms allow-scripts"></iframe>```)
    * Have to change links by prepending Wanderable url
    * Use localStorage to cache old version of Wanderable, otherwise, too many requests (and too slow) to anyorigin. Alternative is cookie, but that stores less data and is not fit for this use-case (Possibly better method is to make a copy of the page and store on my server, updating every day): http://stackoverflow.com/questions/14266730/js-how-to-cache-a-variable

  * Improvements for next time
    * Use forms.py http://www.djangobook.com/en/2.0/chapter07.html or some other form template that I've forgotten the name of
    * Write tests for views and models
    * I wanted to use timeline.js, but Aneesh is the worst (https://timeline.knightlab.com/)
    * More (and better structured) models. Perhaps a guest object that inherits from the user
