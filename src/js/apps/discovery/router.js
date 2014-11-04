define([
    'jquery',
    'backbone',
    'js/components/api_query',
    'js/mixins/dependon'],
  function ($, Backbone, ApiQuery, Dependon) {

    "use strict";

    var Router = Backbone.Router.extend({

      initialize : function(options){
        options = options || {};
        this.history = options.history;
      },

      activate: function (beehive) {
        this.setBeeHive(beehive);
        this.pubsub = beehive.Services.get('PubSub');
        if (!this.pubsub) {
          throw new Exception("Ooops! Who configured this #@$%! There is no PubSub service!")
        }

        this.pubSubKey = this.pubsub.getPubSubKey();

        var navigator = this.getBeeHive().Services.get('Navigator');
        if (!navigator) {
          throw new Exception("Ooops! Who configured this #@$%! There is no Navigator service!")
        }

        /**
         * These 'transitions' could be defined in a separate class; for the moment let's keep
         * them inside 'router'...
         */

        navigator.set('index-page', function() { navigator.getComponent('LandingPageManager').show()});
        navigator.set('results-page', function() { navigator.getComponent('ResultsPageManager').show('search')});
        navigator.set('abstract-page', function() { navigator.getComponent('AbstractPageManager').show('default')});
        navigator.set('abstract-page:abstract', function() { navigator.getComponent('AbstractPageManager').show('abstract')});
        navigator.set('abstract-page:citations', function() { navigator.getComponent('AbstractPageManager').show('citations')});
        navigator.set('abstract-page:references', function() { navigator.getComponent('AbstractPageManager').show('references')});
        navigator.set('abstract-page:coreads', function() { navigator.getComponent('AbstractPageManager').show('coreads')});
        navigator.set('abstract-page:toc', function() { navigator.getComponent('AbstractPageManager').show('toc')});
        navigator.set('abstract-page:similar', function() { navigator.getComponent('AbstractPageManager').show('similar')});
        navigator.set('abstract-page:bibtex', function() { navigator.getComponent('AbstractPageManager').show('bibtex')});
        navigator.set('abstract-page:endnote', function() { navigator.getComponent('AbstractPageManager').show('endnote')});
        navigator.set('abstract-page:metrics', function() { navigator.getComponent('AbstractPageManager').show('metrics')});
      },


      routes: {
        "": "index",
        "search/(:query)": 'search',
        'abs/:bibcode(/)(:subView)': 'view',
        '*invalidRoute': 'noPageFound'
      },


      index: function () {
        this.pubsub(this.pubSubKey, this.pubsub.NAVIGATE, 'index-page');
      },

      search: function (query) {
        if (query) {
          var q= new ApiQuery().load(query);
          this.pubsub.publish(this.pubSubKey, this.pubsub.START_SEARCH, q);
        }
        this.pubsub(this.pubSubKey, this.pubsub.NAVIGATE, 'results-page');
      },

      view: function (bibcode, subPage) {
        if (bibcode){
          if (!subPage) {
            return this.pubsub(this.pubSubKey, this.pubsub.NAVIGATE, 'abstract-page', bibcode);
          }
          else {
            return this.pubsub(this.pubSubKey, this.pubsub.NAVIGATE, 'abstract-page:' + subPage, bibcode);
          }

        }
        this.pubsub(this.pubSubKey, this.pubsub.NAVIGATE, 'results-page');
      },

      noPageFound : function() {
        //i will fix this later
        $("#body-template-container").html("<div>You have broken bumblebee. (404)</div><img src=\"http://imgur.com/EMJhzmL.png\" alt=\"sad-bee\">")
      }


    });

    _.extend(Router.prototype, Dependon.BeeHive);
    return Router;

  });