
define([
    'underscore',
    'jquery',
    'js/components/feedback_mediator',
    'js/components/api_feedback'
  ],

  function (
    _,
    $,
    FeedbackMediator,
    ApiFeedback
    ) {

    var searchStarted = function() {};

    var makeSpace = function() {
      var $btn = $('button.btn-expand.right-expand');
      if ($btn.hasClass('pull-right')) {
        $btn.click();
      }
    };


    return function() {
      var mediator = new FeedbackMediator();
      mediator.addFeedbackHandler(ApiFeedback.CODES.MAKE_SPACE, makeSpace);
      // TODO - register state (to undo the action)

      return mediator;
    }

  });
