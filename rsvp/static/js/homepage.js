$(function (argument) {

  fillOutHoneyFund();
  setCarousel();
  setScrollEvent();

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
  var hashValue;
  function setScrollEvent () {
    $(document).on('scroll',debounce(function () {
      //begins before top but ends in visible area
      //+ 10 allows you to change hash before it hits the top border
      $('.wedding-section').each(function(){
          if ($(this).offset().top < window.pageYOffset + 15 &&
              $(this).offset().top + $(this).height() > window.pageYOffset + 15) {
                hashValue = "#" + $(this).attr('id');
                if (location.hash !== hashValue) {
                  // http://stackoverflow.com/questions/3870057/how-can-i-update-window-location-hash-without-jumping-the-document
                  if(history.pushState) {
                      history.pushState(null, null, hashValue);
                  }
                  else {
                      location.hash = $(this).attr('id');
                  }
                }
          }
      });
    }, 200));
    // From https://davidwalsh.name/javascript-debounce-function
    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    function debounce(func, wait, immediate) {
    	var timeout;
    	return function() {
    		var context = this, args = arguments;
    		var later = function() {
    			timeout = null;
    			if (!immediate) func.apply(context, args);
    		};
    		var callNow = immediate && !timeout;
    		clearTimeout(timeout);
    		timeout = setTimeout(later, wait);
    		if (callNow) func.apply(context, args);
    	};
    }
  }
});
