$(function (argument) {

  fillOutHoneyFund();

  function fillOutHoneyFund () {
    var myKey = "szarWanderablePage",
        previousPageLoad = localStorage[myKey],
        externalUrl = "wanderable.com/hm/szar";

    if (previousPageLoad) {
      previousPageLoad = JSON.parse(previousPageLoad);
      loadData(previousPageLoad.data);
      return;
    }

    $(document).ready(loadWanderable);

     loadData(rsvp.wanderable);

      function loadData (data) {
        var $result = $(data).filter("div"),
            $container = $('.queryResultContainer .one-vh');
        if (data.length > 0) {
           $container.append($result.find("#hm-adonia .rl-location"));
           $container.append($result.find(".hm-item-layout"));
           $container.find("a").each(function (i, el) {
             el.href = "https://wanderable.com" + el.getAttribute("href");
             el.target = "_blank";
           });
        }
      }
  }
});
