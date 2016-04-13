/*
CHECKBOX Setup
1) Call widget on a form/table/group of checkboxes:
    checkboxInstance = rsvp.widget.Checkboxes($form/table, {
      objectType: default is "user",
      allId: OPTIONAL (default is "all-[objectType]s-checkbox"),
      hasAllCheckbox: OPTIONAL (default is true, indicates that there is an all checkbox),
      $actionButtons: OPTIONAL (buttons that will become clickable upon selection)
    })
2) Get back value of selected elements by calling:
    checkboxInstance.selected($form)
3) Clear checkboxes by calling:
    checkboxInstance.clear()
3) Update this.element by calling:
    checkboxInstance.reset($el)
*/
var rsvp = rsvp || {};
rsvp.widget = rsvp.widget || {};
var Checkboxes = rsvp.widget.Checkboxes = function ($table, options) {
  // Default actions
  checkInstance = {
    options: {
      objectType: 'user',
      allId: undefined,
      hasAllCheckbox: true,
      $actionButtons: undefined
    },
    element: $table
  };
  for (var userOption in options) {
    if (options.hasOwnProperty(userOption)) {
      checkInstance.options[userOption] = options[userOption];
    }
  }

  _create();

  // Public methods
  checkInstance.selected = function () {
    var selectedValues = [];
    checkInstance.checkboxes.each(function () {
      if (this.checked) {
        selectedValues.push(this.value);
      }
    });
    return selectedValues;
  };
  checkInstance.clear = function () {
    if (checkInstance.options.hasAllCheckbox) {
      checkInstance.allCheckbox.prop('checked', false);
    }
    checkInstance.checkboxes.prop('checked', false);
  };
  checkInstance.reset = function ($el) {
    if ($el) {
      checkInstance.element = $el;
    } else {
      checkInstance.element = $(_getSelector(checkInstance.element));
    }
    checkInstance.clear();
    // Define important children elements
    _defineChildrenElements();
    if (checkInstance.options.$actionButtons) {
      checkInstance.options.$actionButtons.prop("disabled", true);
    }
    _create();
  };
  checkInstance.destroy = function () {
    if (checkInstance.options.hasAllCheckbox) {
      checkInstance.allCheckbox.off("click.select_all");
    }
    checkInstance.checkboxes.off("change.select_checkbox");
  };

  return checkInstance;

  // Private functions
  function _create() {
    // Define important children elements
    _defineChildrenElements();
    // Set up event listener on "All" checkbox
    if (checkInstance.options.hasAllCheckbox) {
      checkInstance.allCheckbox.on("click.select_all", function (e) {
        e.stopPropagation();
        var selectAllStatus = e.target.checked;
        checkInstance.checkboxes.prop('checked', selectAllStatus);
        if (checkInstance.options.$actionButtons && checkInstance.checkboxes.length) {
          checkInstance.options.$actionButtons.prop("disabled", !selectAllStatus);
        }
      });
    }
    checkInstance.checkboxes.on("click", function (e) {
      e.stopPropagation();
    });
    if (checkInstance.options.$actionButtons || checkInstance.options.hasAllCheckbox) {
      checkInstance.checkboxes.on("change.select_checkbox", function () {
          var numberSelected = checkInstance.checkboxes.filter(":checked").length,
              checkboxSelected = !numberSelected;
          if (checkInstance.options.$actionButtons) {
            checkInstance.options.$actionButtons.prop("disabled", checkboxSelected);
          }
          if (checkInstance.options.hasAllCheckbox) {
            checkInstance.allCheckbox.prop("checked", numberSelected === checkInstance.checkboxes.length);
          }
      });
    }
  }
  function _defineChildrenElements () {
    if (checkInstance.options.hasAllCheckbox) {
      checkInstance.allCheckbox = checkInstance.element.find(_allId());
    }
    var checkboxSelector = "input[type=checkbox]:not(" + _allId() + ")";
    checkInstance.checkboxes = checkInstance.element.find(checkboxSelector);
  }
  function _allId () {
    if (checkInstance.options.allId) {
      return "#" + checkInstance.options.allId;
    } else {
      return "#all-" + checkInstance.options.objectType + "s-checkbox";
    }
  }
  // From http://stackoverflow.com/questions/2420970/how-can-i-get-selector-from-jquery-object
  function _getSelector (el) {
    var selector = $(el).parents()
                        .map(function() {
                          var sel = getIdClass(this);
                          return this.tagName + sel;
                        })
                        .get()
                        .reverse()
                        .concat([el.nodeName])
                        .join(">");

    selector += getIdClass(el);
    //Ignore BODY and HTML tag because it caused problems for me
    return selector.match(/^.*BODY.*?>(.*)$/)[1];

     function getIdClass(elem) {
      var id = $(elem).attr("id"),
          sel = "";
      if (id) {
        sel += "#"+ id;
      }

      var classNames = $(elem).attr("class");
      if (classNames) {
        sel += "." + $.trim(classNames).replace(/\s/gi, ".");
      }
      return sel;
    }
  }
};
