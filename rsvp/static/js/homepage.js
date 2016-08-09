$(function (argument) {

  fillOutHoneyFund();
  setCarousel();
  fillAttendees();

  function fillOutHoneyFund () {
    var $result = $($("#wanderable-text").html()),
        $giftItems = $result.find(".hm-item-layout"),
        $container = $('.queryResultContainer .one-vh'),

        gifts = parseGifts();

    $container.append($result.find("#hm-adonia .rl-location"));
    $container.append("<h5>Sherry</h5>");
    $container.append(getProgressBar("sherry"));
    $container.append("<h5>Aneesh</h5>");
    $container.append(getProgressBar("aneesh"));
    $container.append($giftItems);
    $container.find("a").each(function (i, el) {
      el.href = "https://wanderable.com" + el.getAttribute("href");
      el.target = "_blank";
    });

    function getProgressBar (name) {
      name = name.toLowerCase();
      var $progressBar = $($("#szar-progress-bar").html()),
          $successSegment = $($("#szar-progress-bar-segment").html()),
          $warningSegment = $($("#szar-progress-bar-segment").html()),

          warningMessage = [], successMessage,
          warning = 0, success = 0,
          total = 0,
          currentItem, originalItem, percentage,
          current = gifts.giftItems[name],
          original = gifts.giftItemsOriginal[name];

      for (var item in original) {
        currentItem = current[item];
        originalItem = original[item];
        warning += currentItem;
        total += originalItem;
        percentage = Math.floor(currentItem/originalItem * 100) + "%";
        if (percentage !== "0%") {
          warningMessage.push( item.split("_").join(" ") + ": " + percentage);
        }
      }

      warning = Math.floor(warning/total * 100);
      success = 100 - warning;
      warningMessage = "Still needs | " + warningMessage.join(" / ");
      successMessage = "Progress: " + success + "%";

      $successSegment.attr({
        "aria-valuenow": success,
        "title": successMessage,
      });
      $successSegment.addClass("progress-bar-success");
      $successSegment.css("width", success + "%");
      $successSegment.text(successMessage);
      $successSegment.tooltip();

      $progressBar.append($successSegment);

      $warningSegment.attr({
        "aria-valuenow": warning,
        "title": warningMessage,
      });
      $warningSegment.addClass("progress-bar-warning");
      $warningSegment.css("width", warning + "%");
      $warningSegment.text(warningMessage);
      $warningSegment.tooltip();

      $progressBar.append($warningSegment);

      return $progressBar;
    }

    function parseGifts () {
      var dayValue = 280,
          airfareValue = 325 + 325,
          totalValue = dayValue * 3 + airfareValue,
          giftItemsOriginal = {
            aneesh: {
              day_1: dayValue,
              day_2: dayValue,
              day_3: dayValue,
              day_4: dayValue,
              airfare: airfareValue,
            },
            sherry: {
              day_1: dayValue,
              day_2: dayValue,
              day_3: dayValue,
              day_4: dayValue,
              airfare: airfareValue,
            }
          },
          giftItems = {
            aneesh: {
              day_1: 0,
              day_2: 0,
              day_3: 0,
              day_4: 0,
              airfare: 0,
            },
            sherry: {
              day_1: 0,
              day_2: 0,
              day_3: 0,
              day_4: 0,
              airfare: 0,
            }
          };

      $giftItems.find(".row.il-item-row").each(function (i, el) {
        var $el = $(el),
            titleText =  $el.find(".il-item-title").text().toLowerCase(),
            priceText =  $el.find(".il-item-price").text().toLowerCase(),
            day, person, value = priceText.match(/((\d*)\s@\s)?\$(\d+)/);

        if (titleText.indexOf("airfare") !== -1) {
          day = "airfare";
        } else {
          day = "day_" + titleText.match(/day (\d)/)[1];
        }

        if (titleText.indexOf("aneesh") !== -1) {
          person = "aneesh";
        } else {
          person = "sherry";
        }

        if (value) {
          if (value[1] && value[2]) {
            value = parseInt(value[2]) * parseInt(value[3]);
          } else {
            value = parseInt(value[3]);
          }
          giftItems[person][day] += value;
        } else {
          giftItems[person][day] = 0;
          $el.find(".il-checkout-btn-wrapper button").prop("disabled", true);
        }
      });

      return {
        giftItemsOriginal: giftItemsOriginal,
        giftItems: giftItems,
      };
    }
  }

  function setCarousel() {
    var $carousel = $("#wedding-photos"),
        $swipearea = $carousel.parent(".one-vh"),
        $images = $carousel.find(".item img:not(.hidden)"),
        $carouselInner = $carousel.find(".carousel-inner"),
        $rightArrow = $carousel.find(".right.carousel-control"),
        $leftArrow = $carousel.find(".left.carousel-control");

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
  }

  function fillAttendees () {
    var allAttendees = [], $attendeesDiv, maxInDiv, numberInDiv;
    if (szar.attendees) {
      $attendeesDiv = $("#attendees ul");
      szar.attendees.forEach(function (attendee) {
        var prefix = "",
            guest = attendee.fields.guest,
            formalPrefix = attendee.fields.formal_prefix ?
                           attendee.fields.formal_prefix.trim()  + " " : "",
            plusOnes = attendee.fields.plus_one && attendee.fields.plus_one_name;
        addAttendee(formalPrefix + guest.name.trim());
        if (plusOnes) {
          plusOnes = plusOnes.split(",");
          plusOnes.forEach(addAttendee);
        }
      });

      allAttendees.sort(function (a, b) {
        splitA = a.split(". ");
        splitB = b.split(". ");
        if (splitB[splitB.length - 1].toUpperCase() > splitA[splitA.length - 1].toUpperCase()) {
          return -1;
        }
        return 1;
      });
      maxInDiv = Math.ceil(allAttendees.length / 3);
      allAttendees.forEach(addNameToDiv);
    }

    function addAttendee (name) {
      allAttendees.push(name.trim());
    }

    function addNameToDiv (name, idx) {
      var $div = $attendeesDiv.eq(Math.floor(idx / maxInDiv));
      $div.append("<li>" + name);
    }
  }
});
