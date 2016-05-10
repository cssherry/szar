$(function () {
  var height = window.innerHeight ||
               document.documentElement.clientHeight ||
               document.body.clientHeight;
  var container = document.getElementsByClassName('container'),
      $envelope = $(container).find('.envelope'),
      $front = $envelope.find(".front"),
      $back = $envelope.find(".back"),
      $otherQuestions = $back.find(".szar-attending-questions"),
      $plusOne = $back.find('.plus-one'), plusOneLength = $plusOne.length,
      $flags = $(".menu-buttons img"),
      textDivs = {
        english: $(".english"),
        chinese: $(".chinese"),
      },
      questionDependencies = {
        attending: $otherQuestions,
      };

  // dynamically add plus ones depending on if it is on the page
  $plusOne.each(function (i, el) {
    var selector = "#" + el.id.replace("_boolean", "") + "_name";
    questionDependencies[el.id] = $(selector);
  });

  if (!hasAnimationSupport(["csspseudoanimations", "csspseudotransitions", "csstransitions", "cssanimations", "csstransforms", "csstransforms3d", "preserve3d", "smil"])) {
    // Envelope is going to look strange, hide it and make invitation appear by itself
    $("body").toggleClass("envelope-supported envelope-not-supported");
  } else {
    // Add top-margin to container if the user's window is tiny
    $(window).resize(function () {
      height = window.innerHeight ||
                   document.documentElement.clientHeight ||
                   document.body.clientHeight;
      addMargin();
    });
    addMargin();

    $envelope.one("click", function (e) {
      $envelope.removeClass("button");
      var firstAnimation = $envelope.find("#morphoneleft")[0];
      if (firstAnimation.beginElement) {
        firstAnimation.beginElement();
      }
      setTimeout(function() {
        $envelope.addClass('open');
        window.scrollTo(0,0);
      }, 1000);
      setTimeout(function() {
        $envelope.find(".card").addClass('show-ribbon');
      }, 1300);
    });
  }
  $envelope.removeClass("hidden");

  // Change languages
  $(".menu-buttons").on("click", "img", function (e) {
    var language = this.dataset.language;
    $flags.removeClass("active");
    this.className += "active";
    for (var lang in textDivs) {
      if (lang === language) {
        textDivs[lang].removeClass("hidden");
      } else {
        textDivs[lang].addClass("hidden");
      }
    }
  });
  $flags.filter("[alt=English]").trigger("click");

  // Focus on first item upon clicking ribbon
  $back.find("form input[value='']").removeAttr("value");

  $envelope.on('click', "#rsvp, #invitation", function () {
    $front.toggleClass("hidden");
    $back.toggleClass("hidden");
    if (!$back.hasClass("hidden")) {
      var firstUnfilled = $back.find("input:not([value]):first:visible");
      if (firstUnfilled.length) {
        firstUnfilled.focus();
      } else {
        $back.find("input:first:visible").focus();
      }
    }
  });

  $envelope.find('.rsvp-form input, .rsvp-form textarea').on("focus", function() {
    adjustLabel(this, 'add');
  }).on("blur", function() {
    adjustLabel(this, 'remove');
  }).on("change", function () {
    var $dependentQuestions = questionDependencies[this.name];
    if ($dependentQuestions) {
      if (this.value === "True") {
        $dependentQuestions.removeClass("hidden");
      } else {
        $dependentQuestions.addClass("hidden");
      }
    }
  });
  for (var input_name in questionDependencies) {
    if (questionDependencies.hasOwnProperty(input_name)) {
      // Have to trigger one input at a time :/
      $back.find("[name=" + input_name + "]:checked").trigger("change");
    }
  }

  function adjustLabel (item, type) {
    var $item = $(item),
        itemName = item.name,
        $label = $("label[for=" + itemName + "]");
    if (type === "add") {
      $label.addClass('focus');
    } else {
      $label.removeClass('focus');
    }
  }

  jQuery.validator.addMethod("firstAndLastName", function(value, element) {
    return value.split(" ").length >= 2;
  }, "Please enter the full name (at least 2 words)");


  $envelope.find('.rsvp-form').validate({
    rules: {
      plus_one_name: { firstAndLastName : true }
    },
    submitHandler: function (el, e) {
      e.preventDefault();
      e.stopPropagation();
      var formEntries = {};
      $(el).find(":input:visible").serializeArray().forEach(function (val) {
        if (val.value !== "") {
          if (val.name.indexOf("_boolean") === -1) {
            formEntries[val.name] = formEntries[val.name] || [];
            formEntries[val.name].push(val.value);
          }
        }
      });
      formEntries.plus_one = formEntries.plus_one_name && !!formEntries.plus_one_name.length;
      // Calculated Actual attendees
      if (formEntries.attending[0] !== "False") {
        if (formEntries.plus_one) {
          formEntries.number_attendees = (1 + formEntries.plus_one_name.length);
        } else {
          formEntries.number_attendees = 1;
          formEntries.plus_one_name = "None";
        }
      } else {
        formEntries.number_attendees = 0;
      }
      for (var property in formEntries) {
        if ($.isArray(formEntries[property])) {
          formEntries[property] = formEntries[property].join(",");
        }
      }
      var post_data = {
        "csrfmiddlewaretoken": rsvp.csrf_token,
        formEntries: JSON.stringify(formEntries),
      };
      var url = rsvp.save_rsvp_url;
      if (rsvp.username) {
        url += ("/" + rsvp.username);
      }
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
        $(".notification").append("<p>Visit our main page at <a href='https://szar.us' target='_blank'>szar.us<a></p>");
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
        $(".notification").text("Oops, seems like there's an error. I've been notified and will fix this soon. Please try again later.");
      });

      $envelope.removeClass('open');
      $envelope.find('.show-ribbon').removeClass('show-ribbon');
      setTimeout(function () {
        $envelope.addClass('send');
      }, 600);
      setTimeout(function () {
        $envelope.hide();
        $(".notification").addClass('send');
      }, 1200);
    }
  });

  function addMargin () {
    container[0].style["padding-top"] = 950 - height + "px";
  }

  function hasAnimationSupport(featuresToTest) {
    var hasFeatures = true;
    featuresToTest.forEach(function (f) {
      if (!Modernizr[f]) {
        hasFeatures = false;
      }
    });
    return hasFeatures;
  }
});
