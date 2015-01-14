define([
  'jquery',
  'js/widgets/carousel/widget',
  'js/widgets/base/base_widget',
  'js/bugutils/minimal_pubsub'
], function (
  $,
  CarouselWidget,
  BaseWidget,
  MinimalPubSub
  ) {

  describe("Carousel Widget (carousel_widget.spec.js)", function () {

    var minsub;
    beforeEach(function (done) {
      minsub = new MinimalPubSub({verbose: false});
      done();
    });

    afterEach(function (done) {
      minsub.close();
      var ta = $('#test');
      if (ta) {
        ta.empty();
      }
      done();
    });

    var _getWidget = function() {
      var widget = new CarouselWidget();
      sinon.spy(widget, 'carousel');
      widget.activate(minsub.beehive.getHardenedInstance());
      return widget;
    };

    it("extends BaseWidget", function () {
      expect(new CarouselWidget()).to.be.instanceof(BaseWidget);
    });

    it("displays messages", function(done) {
      var widget = _getWidget();
      expect(widget.pubsub).to.be.undefined;

      var $w = widget.render().$el;
      $('#test').append($w);

      widget.carousel({title: 'hey joe', items:
        [
          {caption: 'one', img: 'http://placehold.it/200x100'},
          {caption: 'two', img: 'http://placehold.it/200x100'}
        ]
      });

      setTimeout(function() {
        expect($w.find('.item.active').text().trim()).to.be.eql('one');
        $w.find('.paginate-right-icon').click();

        setTimeout(function() {
          expect($w.find('.item.active').text().trim()).to.be.eql('two');
          done();
        }, 1000);

      }, 100);

    });



  })

});