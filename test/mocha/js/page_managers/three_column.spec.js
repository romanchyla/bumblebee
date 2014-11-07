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
    'hbs!/test/mocha/js/page_managers/toc-layout'
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
    TOCTemplate
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
          ShowReferences: 'js/widgets/references/widget'
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

          $('#test').append(pageManager.view.el);
          var $w = pageManager.view.$el;
          expect($w.find('[data-widget="SearchWidget"]').children().length).to.be.equal(1);
          expect($w.find('[data-widget="ShowAbstract"]').children().length).to.be.equal(1);
          expect($w.find('[data-widget="ShowReferences"]').children().length).to.be.equal(1);

          pageManager.show('SearchWidget', 'ShowAbstract');

          done();
        });

      });
    });


  });
});