define([
    'js/components/application',
    'js/page_managers/three_column',
    'marionette',
    'js/widgets/base/base_widget',
    'underscore'
  ],
  function(
    Application,
    ThreeColumnPageManager,
    Marionette,
    BaseWidget,
    _
    ) {

  describe("Three column PageManager", function () {

    var config = null;
    beforeEach(function() {
      config = {
        core: {
          services: {
            'Api': 'js/services/api',
            'PubSub': 'js/services/pubsub'
          },
          modules: {
            QM: 'js/components/query_mediator'
          }
        },
        widgets: {
          Results: 'js/widgets/results/widget',
          QueryInfo: 'js/widgets/query_info/query_info_widget',
          Authors: 'js/widgets/query_info/query_info_widget',
          PageManager: 'js/page_managers/three_column'
        }
      };
    });


    it("should create page manager object", function() {
      expect(new ThreeColumnPageManager()).to.be.instanceof(BaseWidget);
    });

    it("assembles the page view", function(done) {
      var app = new Application();
      app.loadModules(config).done(function() {

        app.activate();

        var pageManager = app.getWidget('PageManager');

        pageManager.assemble(app);

        $('#test').append(pageManager.view.el);
        expect(_.keys(pageManager.widgets).length).to.be.equal(3);

        done();
      });

    });


  });
});