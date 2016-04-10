$(function () {
  var $buttons = $("button"),
      $emailButton = $buttons.filter(".email"),
      $deleteGuests = $buttons.filter("#delete-guests-button"),
      checkboxes = rsvp.widget.Checkboxes($("#guest-list-table"), {
        objectType: "guest",
        $actionButtons: $buttons
      });

  $emailButton.on("click.sendInvitation", function (e) {
    var url = rsvp.save_rsvp_url + "/" + e.target.name,
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
});
