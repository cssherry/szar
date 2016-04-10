$(function () {
  var $buttons = $("button"),
      $emailButton = $buttons.filter(".email"),
      $deleteGuests = $buttons.filter("#delete-guests-button"),
      $table = $("#guest-list-table"),
      checkboxes = rsvp.widget.Checkboxes($table, {
        objectType: "guest",
        $actionButtons: $buttons
      });

  $table.append($table.find(".rsvp-maybe"));

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
    .fail(function(req) {
      console.log("Email failed: ", req);
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
    .fail(function(req) {
      console.log("Failed To Delete Users: ", req);
    });
  });
});
