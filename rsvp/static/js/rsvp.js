$(function (argument) {
  var height = window.innerHeight ||
               document.documentElement.clientHeight ||
               document.body.clientHeight;
  var container = document.getElementsByClassName('container'),
      $envelope = $(container).find('.envelope'),
      $front = $envelope.find(".front"),
      $back = $envelope.find(".back");
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
    if (this.value !== '') {
      $(this).prev('label').addClass("show");
    } else {
      $(this).prev('label').removeClass("show");
    }
  }).on("focus", function() {
    $(this).prev("label").addClass('focus');
  }).on("blur", function() {
    $(this).prev("label").removeClass('focus');
  });

  $envelope.find('.rsvp-form').on('submit', function (e) {
    e.preventDefault();
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
