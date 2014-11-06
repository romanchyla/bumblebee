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
          },
          objects: {
            ThreeColManager: 'js/page_managers/three_column'
          }
        },
        widgets: {
          Results: 'js/widgets/results/widget',
          AuthorFacet: 'js/wraps/author_facet',
          GraphTabs : 'js/wraps/graph_tabs'

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

        var pageManager = app.getObject('ThreeColManager');

        pageManager.assemble(app);

        $('#test').append(pageManager.view.el);
        expect(_.keys(pageManager.widgets).length).to.be.gt(1);

        var $w = pageManager.view.$el;
        expect($w.find('[data-widget="AuthorFacet"]').children().length).to.be.equal(1);
        expect($w.find('[data-widget="Results"]').children().length).to.be.equal(1);
        expect($w.find('[data-widget="GraphTabs"]').children().length).to.be.equal(1);

        done();
      });

    });


  });
});