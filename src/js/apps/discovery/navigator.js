/**
 * The main 'navigation' enpoints (the part executed inside
 * the applicaiton) - this is a companion to the 'router'
 */

define([
    'jquery',
    'backbone',
    'js/services/navigator'],
  function ($, Backbone, ApiQuery, Dependon) {

    "use strict";

    var NavigatorService = Navigator.extend({

      start: function(app) {
        /**
         * These 'transitions' are what happens inside 'discovery' application
         */

        this.set('index-page', function() { app.getObject('LandingPageManager').show()});
        this.set('results-page', function() { app.getObject('ResultsPageManager').show('search')});
        this.set('abstract-page', function() { app.getObject('AbstractPageManager').show('default')});
        this.set('abstract-page:abstract', function() { app.getObject('AbstractPageManager').show('abstract')});
        this.set('abstract-page:citations', function() { app.getObject('AbstractPageManager').show('citations')});
        this.set('abstract-page:references', function() { app.getObject('AbstractPageManager').show('references')});
        this.set('abstract-page:coreads', function() { app.getObject('AbstractPageManager').show('coreads')});
        this.set('abstract-page:toc', function() { app.getObject('AbstractPageManager').show('toc')});
        this.set('abstract-page:similar', function() { app.getObject('AbstractPageManager').show('similar')});
        this.set('abstract-page:bibtex', function() { app.getObject('AbstractPageManager').show('bibtex')});
        this.set('abstract-page:endnote', function() { app.getObject('AbstractPageManager').show('endnote')});
        this.set('abstract-page:metrics', function() { app.getObject('AbstractPageManager').show('metrics')});
      }


    });

    return NavigatorService;

  });

