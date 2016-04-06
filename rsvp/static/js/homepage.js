$(function (argument) {

  fillOutHoneyFund();
  setCarousel();

  function fillOutHoneyFund () {
    var $result = $($("#wanderable-text").html()),
        $container = $('.queryResultContainer .one-vh');
    $container.append($result.find("#hm-adonia .rl-location"));
    $container.append($result.find(".hm-item-layout"));
    $container.find("a").each(function (i, el) {
      el.href = "https://wanderable.com" + el.getAttribute("href");
      el.target = "_blank";
    });
  }

  function setCarousel() {
    var $carousel = $("#wedding-photos"),
        $swipearea = $carousel.parent(".one-vh"),
        $images = $carousel.find(".item img:not(.hidden)"),
        $carouselInner = $carousel.find(".carousel-inner"),
        $rightArrow = $carousel.find(".right.carousel-control"),
        $leftArrow = $carousel.find(".left.carousel-control");
    // Set the minimum height as height of carousel, prevents moving up and down
    $images.imagesLoaded(function (il) {
      resizeCarousel($images);
    });
    $(window).resize(function () {
      resizeCarousel($images);
    });

    if (Modernizr.touchevents) {
      $swipearea.on("swiperight.changeCarousel", function (e) {
        $leftArrow.trigger("click");
        $leftArrow.trigger("click");
      });
      $swipearea.on("swipeleft.changeCarousel", function (e) {
        $rightArrow.trigger("click");
        $rightArrow.trigger("click");
      });
    }

    function resizeCarousel (els) {
      var shortest;
      $carouselInner.css('height', "auto");
      els.each(function (i, el) {
        var $parent = $(el).parent(),
            oldActive = $parent.hasClass("active");
        $parent.addClass("active");
        if (shortest) {
          shortest = Math.min(shortest, el.clientHeight);
        } else {
          shortest = el.clientHeight;
        }
        if (!oldActive) {
          $parent.removeClass("active");
        }
      });
      $carouselInner.css("height", shortest);
    }
  }
});
