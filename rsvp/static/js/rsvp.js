$(function (argument) {
  var height = window.innerHeight ||
               document.documentElement.clientHeight ||
               document.body.clientHeight;
  var container = document.getElementsByClassName('container'),
      $envelope = $(container).find('.envelope'),
      $front = $envelope.find(".front"),
      $back = $envelope.find(".back"),
      $otherQuestions = $back.find(".szar-attending-questions"),
      $plusOne = $back.find('#plus-one'),
      $plusOneName = $back.find('#plus-one-name'),
      $flags = $(".szar-flags img"),
      textDivs = {
        english: $(".english"),
        chinese: $(".chinese"),
      },
      questionDependencies = {
        attending: $otherQuestions,
        plus_one: $plusOneName,
      };
  // Add top-margin to container if the user's window is tiny
  $(window).resize(function () {
    height = window.innerHeight ||
                 document.documentElement.clientHeight ||
                 document.body.clientHeight;
    addMargin();
  });
  addMargin();
  function addMargin () {
    container[0].style["padding-top"] = 750 - height + "px";
  }
  // Change languages
  $(".szar-flags").on("click", "img", function (e) {
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
  $envelope.one("click", function (e) {
    $envelope.removeClass("button");
    $envelope.find("#morphoneleft")[0].beginElement();
    setTimeout(function() {
      $envelope.addClass('open');
      window.scrollTo(0,0);
    }, 1000);
    setTimeout(function() {
      $envelope.find(".card").addClass('show-ribbon');
    }, 1300);
  });

  $envelope.on('click', "#rsvp, #invitation", function () {
    $front.toggleClass("hidden");
    $back.toggleClass("hidden");
  });

  $envelope.find('.rsvp-form input, .rsvp-form textarea').on('keyup', function() {
    var $input = $(this);
    if (!$input.hasClass(".always-show")) {
      if (this.value !== '') {
        $input.prev('label').addClass("show");
      } else {
        $input.prev('label').removeClass("show");
      }
    }
  }).on("focus", function() {
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

  function adjustLabel (item, type) {
    var $item = $(item),
        itemName = item.name,
        $label = $item.siblings("label[for=" + itemName + "]");
    if (type === "add") {
      $label.addClass('focus');
    } else {
      $label.removeClass('focus');
    }
  }

  $envelope.find('.rsvp-form').on('submit', function (e) {
    e.preventDefault();
    var formEntries = {};
    $(this).serializeArray().forEach(function (val) {
      formEntries[val.name] = formEntries[val.name] || [];
      formEntries[val.name].push(val.value);
    });
    for (var property in formEntries) {
      formEntries[property] = formEntries[property].join(",");
    }
    var post_data = {
      "csrfmiddlewaretoken": rsvp.csrf_token,
      formEntries: JSON.stringify(formEntries),
    };
    var url = rsvp.save_rsvp_url;

    $.ajax({
      url: url,
      data: post_data,
      type: 'POST',
    })
    .done(function(data) {
      styleid = data[0];
    })
    .fail(function(req) {
      console.log("Form submission failed: ", req);
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
  });
});
