$(function () {
  var notification = $(".control-label"),
      addressFormGroup = $(".address-form .form-group");
  $('.address-form').validate({
    submitHandler: function (el, e) {
      e.preventDefault();
      e.stopPropagation();
      var formEntries = {};
      $(el).find(":input:visible").serializeArray().forEach(function (val) {
        if (val.value !== "") {
          if (val.name.indexOf("_boolean") === -1) {
            formEntries[val.name] = val.value;
          }
        }
      });
      var post_data = {
        "csrfmiddlewaretoken": address.csrfToken,
        formEntries: JSON.stringify(formEntries),
      };
      var url = address.updateLink;

      function csrfSafeMethod(method) {
          // these HTTP methods do not require CSRF protection
          return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
      }
      $.ajax({
        url: url,
        data: post_data,
        type: 'POST',
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", rsvp.csrf_token);
            }
        }
      })
      .done(function(data) {
        console.log("Form submission worked!", data);
        addressFormGroup.removeClass("has-error");
        addressFormGroup.addClass("has-success");
        notification.text("Thank you! We've received your address.");
      })
      .fail(function(req, textStatus, errorThrown) {
        console.log("Form submission failed: ", req);
        Raven.captureException(new Error('RSVP Fail'),{
          extra: {
            req: req,
            textStatus: textStatus,
            errorThrown: errorThrown,
            url: url,
            post_data: post_data
          }
        });
        addressFormGroup.addClass("has-error");
        addressFormGroup.removeClass("has-success");
        notification.text("Oops, seems like there's an error. I've been notified and will fix this soon. No need for you to do anything!");
      });
    }
  });
});
