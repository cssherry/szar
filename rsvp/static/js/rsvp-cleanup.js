$(function () {
  // Shrink heart to 60px and hide text when menu is shown
  // Otherwise, expanded navbar will cut off logo ugily
  var $nav = $("nav #navbar"),
      $heart = $("#navbar-logo"),
      $letters = $heart.find(".container");
  $nav.on("show.bs.collapse", function () {
    $heart.css("height", 60);
    $letters.addClass("hidden");
  });
  $nav.on("hidden.bs.collapse", function () {
    $heart.css("height", 110);
    $letters.removeClass("hidden");
  });
  // Upgrade images, from http://stackoverflow.com/a/31370466/4607533
  $("img.hidden").on("load.upgrade", upgradeImage);
  function upgradeImage(el) {
    var $el = $(el.target);
    $el.siblings("img").attr("src", el.target.src);
  }
});
