define([
  'underscore',
  'js/components/api_feedback',
  'js/components/feedback_mediator',
  'js/components/generic_module',
  'js/bugutils/minimal_pubsub'
  ], function(
  _,
  ApiFeedback,
  FeedbackMediator,
  GenericModule,
  MinimalPubSub
  ) {

  describe("Feedback mediator (feedback_mediator.spec.js)", function () {

    var minsub;
    beforeEach(function() {
      minsub = new (MinimalPubSub.extend({
        request: function(apiRequest) {
          return {
            "responseHeader": {
              "status": 0,
              "QTime": 543,
              "params": {
                "q": "star"
              }
            }
          }
        }
      }))({verbose: false});
    });

    afterEach(function() {
      minsub.close();
    });


    it("should return API object", function() {
      expect(new FeedbackMediator()).to.be.instanceof(GenericModule);
      expect(new FeedbackMediator().getHardenedInstance).to.be.undefined;
    });

    it("listens to FEEDBACK", function() {
      var fm = new FeedbackMediator();
      sinon.spy(fm, 'receiveFeedback');
      fm.activate(minsub.beehive);

      minsub.publish(minsub.FEEDBACK, new ApiFeedback({code: 0, msg: 'foo'}));

      expect(fm.receiveFeedback.callCount).to.be.eql(1);

      minsub.publish(minsub.createRequest({'target': '/foo',
        'query': minsub.createQuery({'q': 'foo:bar'})}))
    });

    it("has all methods necessary to manage its own state and receive FEEDBACK events", function() {
      var fm = new FeedbackMediator();

      sinon.spy(fm, 'receiveFeedback');
      sinon.spy(fm, 'handleFeedback');

      var f = new ApiFeedback({code: 200, msg: null});
      f.setSenderKey('fooId');

      var doNothing = function(x) {return true;}
      var h200 = sinon.spy(doNothing);
      var h200FooId = sinon.spy(doNothing);
      var hFooId = sinon.spy(doNothing);

      fm.addFeedbackHandler(200, h200);
      fm.addFeedbackHandler('200:fooId', h200FooId);
      fm.addFeedbackHandler('fooId', hFooId);

      var ck = fm._getCacheKey(f);
      expect(ck).to.be.eql('fooId');
      expect(fm._retrieveCacheEntry(ck)).to.be.null;


      fm.receiveFeedback(f, null);
      expect(h200FooId.callCount).to.be.eql(1);


      fm.removeFeedbackHandler('200:fooId');
      fm.receiveFeedback(f, null);
      expect(hFooId.callCount).to.be.eql(1);

      fm.removeFeedbackHandler('fooId');
      fm.receiveFeedback(f, null);
      expect(h200.callCount).to.be.eql(1);

      expect(fm.handleFeedback.callCount).to.be.eql(0);

      fm.removeFeedbackHandler('200');
      fm.receiveFeedback(f, null);
      expect(fm.handleFeedback.callCount).to.be.eql(1);


    });

  });

});
