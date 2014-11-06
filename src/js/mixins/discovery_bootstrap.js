
/*
 * This module contains a set of utilities to bootstrap Discovery app
 */
define([
    'underscore',
    'backbone',
    'js/page_managers/abstract_page_controller',
    'js/page_managers/results_page_controller',
    'js/page_managers/landing_page_controller',
    'js/page_managers/master_page_manager',
    'js/components/api_query',
    'js/components/api_request'
    ],
  function(
    _,
    Backbone,
    AbstractController,
    ResultsController,
    LandingPageController,
    MasterPageManager,
    ApiQuery,
    ApiRequest) {

  var Mixin = {

    configure: function() {

      var conf = this.getObject('DynamicConfig');

      if (conf) {

        var beehive = this.getBeeHive();
        var api = beehive.getService('Api');

        if (conf.root) {
          api.url = conf.root + "/" + api.url;
          this.root = conf.root;
        }
        if (conf.debug !== undefined) {
          beehive.debug = conf.debug;
          this.getObject('QueryMediator').debug = conf.debug;
        }

        if (conf.apiRoot) {
          api.url = conf.apiRoot;
        }

        this.bootstrapUrls = conf.bootstrapUrls;
      }

    },

    bootstrap: function() {

      var defer = $.Deferred();

      // this is the application dynamic config
      var api = this.getBeeHive().getService('Api');

      // load configuration from remote endpoints
      if (this.bootstrapUrls) {

        var pendingReqs = this.bootstrapUrls.length;
        var retVal = {};

        // harvest information from the remote urls and merge it into one object
        var opts = {
          done: function (data) {
            pendingReqs--;
            _.extend(retVal, data);
            if (pendingReqs <= 0) defer.resolve(retVal);
          },
          fail: function () {
            pendingReqs--;
            if (pendingReqs <= 0) defer.resolve(retVal);
          },
          type: 'GET'
        };
        var redirect_uri = location.origin + location.pathname;

        _.each(this.bootstrapUrls, function (url) {
          if (url.indexOf('http') > -1) {
            opts.u = url;
          }
          else {
            delete opts.u;
          }

          api.request(new ApiRequest({
              query: new ApiQuery({redirect_uri: redirect_uri}),
              target: '/bumblebee/bootstrap'}),
            opts);
        });

        setTimeout(function() {
            if (defer.state() == 'resolved')
              return;
            defer.reject();
          },
          3000);
      }
      else {
        setTimeout(function() {
          defer.resolve({}),
            1
        });
      }
      return defer;
    },

    /**
     * Reload the application - by simply changing the URL (append bbbRedirect=1)
     * If the url already contains 'bbbRedirect', redirect to the error page.
     * @param errorPage
     */
    reload: function(endPage) {
      if (location.search && location.search.indexOf('bbbRedirect=1') > -1) {
        return this.redirect(endPage);
      }
      location.search = location.search ? location.search + '&bbbRedirect=1' : 'bbbRedirect=1';
    },

    redirect: function(endPage) {
      if (this.router) {
        location.pathname = this.router.root + endPage;
      }
      // let's replace the last element from pathname - this code will run only when
      // router is not yet available; therefore it should hit situations when the app
      // was not loaded (but it is not bulletproof - the urls can vary greatly)
      // TODO: intelligently explore the rigth url (by sending HEAD requests)
      location.href = location.protocol + '//' + location.hostname + ':' + location.port +
        location.pathname.substring(0, location.pathname.lastIndexOf('/')) + '/' + endPage;
    },

    start: function(Router) {
      var app = this;
      var beehive = this.getBeeHive();
      var api = beehive.getService("Api");
      var FacetFactory = app.getModule("FacetFactory");
      var conf = this.getObject('DynamicConfig');





      var bumblebeeHistory = app.getObject("HistoryManager");

      var pageControllers = {};
      pageControllers.results = app.getWidget()


      pageControllers.abstract = new AbstractController({widgetDict: {
        abstract: abstract,
        references: references,
        citations: citations,
        coreads: coreads,
        tableOfContents: tableOfContents,
        similar: similar,
        searchBar: resultsWidgetDict.searchBar,
        resources: resources
      }});

      pageControllers.index = new LandingPageController({widgetDict: {searchBar: resultsWidgetDict.searchBar}});

      _.each(pageControllers, function (v, k) {
        v.activate(beehive.getHardenedInstance())
      });

      var masterPageManager = new MasterPageManager({pageControllers: pageControllers, history: bumblebeeHistory});

      masterPageManager.activate(beehive.getHardenedInstance());

      app.router = new Router({pageManager: masterPageManager});
      app.router.activate(beehive.getHardenedInstance());

      // Trigger the initial route and enable HTML5 History API support


      Backbone.history.start(conf.routerConf);


      // All navigation that is relative should be passed through the navigate
      // method, to be processed by the router. If the link has a `data-bypass`
      // attribute, bypass the delegation completely.
      $(document).on("click", "a[href]:not([data-bypass])", function (evt) {

        var attr = $(this).attr("href");

        //getting rid of first character so router.routes can easily do regex matches
        var withoutSlashOrHash = attr.match(/^[#/]*(.*)/);
        withoutSlashOrHash = withoutSlashOrHash.length === 2 ? withoutSlashOrHash[1] : attr;

        var route = _.find(Backbone.history.handlers, function (h) {
          //testing to see if it matches any router route other than the "catchall" 404 route
          if (h.route.test(withoutSlashOrHash) && h.route.toString() !== /^(.*?)$/.toString()) {

            return true
          }
        });

        if (route !== undefined) {

          evt.preventDefault();
          Backbone.history.navigate(attr, true);
        }
      });

      $(document).on("scroll", function () {

        if ($("#landing-page-layout").length > 0) {
          return
        }
        //navbar is currently 40 px height
        if ($(window).scrollTop() > 50) {
          $(".s-search-bar-full-width-container").addClass("s-search-bar-motion");
        }
        else {
          $(".s-search-bar-full-width-container").removeClass("s-search-bar-motion")
        }
      });


    }


  };

  return Mixin;
});
