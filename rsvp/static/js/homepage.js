$(function (argument) {

  fillOutHoneyFund();

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
});
