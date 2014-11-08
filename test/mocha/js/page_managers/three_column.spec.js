define([
    'underscore',
    'jquery',
    'marionette',
    'js/components/application',
    'js/widgets/base/base_widget',
    'js/page_managers/three_column_view',
    'js/page_managers/controller',
    'hbs!/test/mocha/js/page_managers/one-column',
    'hbs!/test/mocha/js/page_managers/three-column',
    'js/page_managers/one_column_view',
    'js/page_managers/toc_controller',
    'hbs!/test/mocha/js/page_managers/toc-layout',
    '../widgets/test_json/test1',
    'js/components/api_response',
    'js/components/api_query'
  ],
  function(
    _,
    $,
    Marionette,
    Application,
    BaseWidget,
    ThreeColumnView,
    PageManagerController,
    OneColumnTemplate,
    ThreeColumnTemplate,
    OneColumnView,
    TOCPageManagerController,
    TOCTemplate,
    testData,
    ApiResponse,
    ApiQuery
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
            PageManager: 'js/page_managers/controller'
          }
        },
        widgets: {
          SearchWidget: 'js/widgets/search_bar/search_bar_widget',
          Results: 'js/widgets/results/widget',
          AuthorFacet: 'js/wraps/author_facet',
          GraphTabs : 'js/wraps/graph_tabs',

          TOCWidget: 'js/page_managers/toc_widget',
          TOCTitleWidget: 'js/page_managers/title_widget',
          ShowAbstract: 'js/widgets/abstract/widget',
          ShowReferences: 'js/widgets/references/widget',

          //PageManager: 'js/page_managers/controller'
        }
      };
    });

    describe.skip("Three column page manager", function() {
      it("should create page manager object", function() {
        expect(new PageManagerController()).to.be.instanceof(BaseWidget);
      });

      it("assembles the page view", function(done) {
        var app = new Application();
        app.loadModules(config).done(function() {

          // hack (normally this will not be the usage pattern)
          var pageManager = app.getObject("PageManager");
          pageManager.createView = function(options) {
            var TV = ThreeColumnView.extend({template: ThreeColumnTemplate});
            return new TV(options)
          };
          // var pageManager = new (PageManagerController.extend({
          // createView: function(options) {return new ThreeColumnView(options)}
          // }))();

          app.activate();
          pageManager.assemble(app);

          //$('#test').append(pageManager.view.el);
          expect(_.keys(pageManager.widgets).length).to.be.gt(1);

          var $w = pageManager.view.$el;
          expect($w.find('[data-widget="AuthorFacet"]').children().length).to.be.equal(1);
          expect($w.find('[data-widget="Results"]').children().length).to.be.equal(1);
          expect($w.find('[data-widget="GraphTabs"]').children().length).to.be.equal(1);

          done();
        });

      });
    });

    describe.skip("One column page manager", function() {

      it("assembles the page view", function(done) {
        var app = new Application();
        app.loadModules(config).done(function() {

          // hack (normally this will not be the usage pattern)
          var pageManager = app.getObject("PageManager");
          pageManager.createView = function(options) {
            var TV = OneColumnView.extend({template: OneColumnTemplate});
            return new TV(options)
          };

          app.activate();
          pageManager.assemble(app);

          //$('#test').append(pageManager.view.el);
          var $w = pageManager.view.$el;
          expect($w.find('[data-widget="SearchWidget"]').children().length).to.be.equal(1);

          done();
        });

      });
    });

    describe("TOC page manager", function() {

      it("assembles the page view", function(done) {
        var app = new Application({debug: true});
        config.core.objects.PageManager = 'js/page_managers/toc_controller';

        app.loadModules(config).done(function() {

          // hack (normally this will not be the usage pattern)
          var pageManager = app.getObject("PageManager");
          pageManager.createView = function(options) {
            var TV = ThreeColumnView.extend({template: TOCTemplate});
            return new TV(options)
          };

          app.activate();
          pageManager.assemble(app);

          //$('#test').append(pageManager.view.el);
          var $w = pageManager.view.$el;
          expect($w.find('[data-widget="SearchWidget"]').children().length).to.be.equal(1);
          expect($w.find('[data-widget="ShowAbstract"]').children().length).to.be.equal(1);
          expect($w.find('[data-widget="ShowReferences"]').children().length).to.be.equal(1);

          pageManager.show('SearchWidget', 'ShowAbstract', 'TOCWidget');

          // deliver data to the widget for display
          var abstract = app.getWidget('ShowAbstract');
          var references = app.getWidget('ShowReferences');
          var r = new ApiResponse(testData);
          r.setApiQuery(new ApiQuery({q: 'foo'}));

          abstract.processResponse(r);

          // the navigation must turn active
          expect(pageManager.view.$el.find('[data-widget-id="ShowAbstract"]').hasClass('s-abstract-nav-inactive')).to.be.false;
          expect(pageManager.view.$el.find('[data-widget-id="ShowReferences"]').hasClass('s-abstract-nav-inactive')).to.be.true;

          // simulated late arrival
          references.processResponse(r);
          expect(pageManager.view.$el.find('[data-widget-id="ShowAbstract"]').hasClass('s-abstract-nav-inactive')).to.be.false;
          expect(pageManager.view.$el.find('[data-widget-id="ShowReferences"]').hasClass('s-abstract-nav-inactive')).to.be.false;

          // click on the link (NAVIGATE event should be triggered)
          var pubsub = app.getService('PubSub').getHardenedInstance();
          var spy = sinon.spy();
          pubsub.subscribe(pubsub.NAVIGATE, spy);
          pageManager.view.$el.find('[data-widget-id="ShowReferences"]').click();
          expect(spy.callCount).to.be.eql(1);

          done();
        });

      });
    });


  });
});