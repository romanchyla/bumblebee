define([
  'backbone',
  'marionette',
  'hbs!./templates/abstract-nav',

], function(
  Backbone,
  Marionette,
  tocNavigationTemplate
  ){


  var WidgetData = Backbone.Model.extend({
    defaults : function(){
      return {
        id: undefined, // widgetId
        path: undefined,
        title: undefined,
        isActive : false,
        isSelected: false,
        numFound : 0
      }
    }
  });

  var WidgetCollection = Backbone.Collection.extend({
    model : WidgetData
  });


  var WidgetModel = Backbone.Model.extend({
    defaults : function(){
      return {
        bibcode : undefined,
        query: undefined
      }
    }
  });

  var TocNavigationView = Marionette.ItemView.extend({

    constructor: function(options) {
      options = options || {};
      if (!options.collection)
        options.collection = new WidgetCollection();

      if (!options.model)
        options.model = new WidgetModel();

      Marionette.ItemView.prototype.constructor.call(this, options);
      this.on("page-manager-message", this.onPageManagerMessage);
    },

    serializeData : function(){
      var data = {};
      data = _.extend(data, this.model.toJSON());
      data = _.extend(data, {items : this.collection.toJSON()});
      return data;
    },

    template : tocNavigationTemplate,

    events : {
      "click a" : function(e){
        var $t  = $(e.currentTarget);
        var idAttribute = $t.find("div").attr("data-widget-id");
        if ($t.find("div").hasClass("s-abstract-nav-inactive")){
          return false;
        }
        else if (idAttribute !== $(".s-abstract-nav-active").attr("data-widget-id")) {
          this.trigger('page-manager-event', 'widget-selected', idAttribute);
          this.collection.get(idAttribute).set('isSelected', true);
        }
        return false;
      }
    },

    modelEvents : {
      "change:bibcode" : "render"
    },

    collectionEvents : {
      "add": "render",
      "setActive" : "render",
      "change:numFound" : "render"
    },


    onPageManagerMessage: function(event, data) {
      if (event == 'new-widget') {
        //this.collection.set([new WidgetData({widgetData: arguments[1]})]);
        var widgetId = arguments[1]; var parent = this.$el.parent();
        if (parent.data(widgetId.toLowerCase())) {
          var title = widgetId; var path = '';
          var parts = parent.data(widgetId.toLowerCase()).split('|');
          title = parts[0]; path = parts[1];
          this.collection.add({id: widgetId, title: title, path: path});
        }
      }
      else if (event == 'widget-ready') {
        var model = this.collection.get(data.widgetId);
        if (model) {
          model.set(_.pick(data, model.keys()));
        }
      }
    }

  });

  return TocNavigationView;
});