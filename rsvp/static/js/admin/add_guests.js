$(function () {
  var $buttons = $("#main > button"),
      $emailButton = $buttons.filter(".email"),
      $deleteGuests = $buttons.filter("#delete-guests-button"),
      $table = $("#guest-list-table"),
      checkboxes = rsvp.widget.Checkboxes($table, {
        objectType: "guest",
        $actionButtons: $buttons
      });

  $table.DataTable( {
    "paging": false,
    searching: false,
    drawCallback: function () {
      var api = this.api();
      $( api.table().footer() ).find("td").each(function (i, el) {
        var contents = "";
        if ([7].indexOf(i) !== -1) {
          el.textContent = api.column( i, {page:'current'} ).data().sum();
        } else if (i === 6) {
          contents += "Saturday: ";
          contents += api.column( i, {page:'current'} ).data().filter(function (d, i) {
            return d.indexOf(1) !== -1;
          }).count();
          contents += " / Sunday: ";
          contents += api.column( i, {page:'current'} ).data().filter(function (d, i) {
            return d.indexOf(2) !== -1;
          }).count();
          el.textContent = contents;
        } else if ( [8, 9, 10].indexOf(i) !== -1 ) {
          el.textContent = api.column( i, {page:'current'} ).data().filter(function (d, i) {
            return d.indexOf("True") !== -1;
          }).count();
        } else if ( i === 3 ) {
          el.textContent = api.column( i, {page:'current'} ).data().map(function (e) {
            return parseFloat(e.match(/[0-9\.]+/));
          }).sum();
        }
      });
    }
  });

  $table.on("click.changeNumber", ".input-group-btn > button", function (e) {
    var $el = $(e.target),
        $number = $($el).closest(".input-group").find(".number"),
        oldNumber = parseFloat($number.text()), newNumber;
    if ($el.hasClass("btn-minus")) {
      newNumber = oldNumber - 0.5;
    } else {
      newNumber = oldNumber + 0.5;
    }
    if (newNumber < 0 || newNumber > 4) {
      return;
    }
    var $tr = $($el).closest("tr"),
        username = $tr.find(".guest-username").text(),
        post_data = {
          "csrfmiddlewaretoken": rsvp.csrf_token,
        },
        url = rsvp.change_number_url + "/" + username + "/" + newNumber;
    $.ajax({
      url: url,
      data: post_data,
      type: 'POST',
    })
    .success(function (req) {
      console.log("User changed: ", req);
      $number.text(newNumber);
      if (newNumber > 0 && $tr.hasClass("rsvp-maybe")) {
        $tr.toggleClass("rsvp-maybe rsvp-" + $tr.find(".guest-status").text());
      } else if (newNumber === 0 && !$tr.hasClass("rsvp-maybe")) {
        $tr.addClass("rsvp-maybe");
        $tr.removeClass("rsvp-None rsvp-False, rsvp-True");
      }
    })
    .fail(function(req, textStatus, errorThrown) {
      console.log("Email failed: ", req);
      Raven.captureException(new Error('Changing Attendees failed'),{
        extra: {
          req: req,
          textStatus: textStatus,
          errorThrown: errorThrown
        }
      });
    });
  });

  $emailButton.on("click.sendInvitation", function (e) {
    var url = rsvp.add_guests_url + "/" + e.target.name,
        post_data = {
          "csrfmiddlewaretoken": rsvp.csrf_token,
          selection: JSON.stringify(checkboxes.selected()),
        };

    $.ajax({
      url: url,
      data: post_data,
      type: 'POST',
    })
    .success(function (req) {
      checkboxes.clear();
      console.log("Email sent: ", req);
    })
    .fail(function(req, textStatus, errorThrown) {
      console.log("Email failed: ", req);
      Raven.captureException(new Error('Email Failed'),{
        extra: {
          req: req,
          textStatus: textStatus,
          errorThrown: errorThrown
        }
      });
    });
  });

  $deleteGuests.on("click.deleteGuests", function (e) {
    var url = rsvp.delete_rsvp_url,
        post_data = {
          "csrfmiddlewaretoken": rsvp.csrf_token,
          selection: JSON.stringify(checkboxes.selected()),
        };
    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    $.ajax({
      url: url,
      data: post_data,
      type: 'DELETE',
      beforeSend: function(xhr, settings) {
          if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
              xhr.setRequestHeader("X-CSRFToken", rsvp.csrf_token);
          }
      }
    })
    .success(function (req) {
      checkboxes.selected().forEach(function (sel) {
        $table.find("#rsvp-id-" + sel).remove();
      });
      console.log("Users Deleted: ", req);
      checkboxes.reset();
    })
    .fail(function(req, textStatus, errorThrown) {
      console.log("Failed To Delete Users: ", req);
      Raven.captureException(new Error('User Deletion Failed'),{
        extra: {
          req: req,
          textStatus: textStatus,
          errorThrown: errorThrown
        }
      });
    });
  });
});
