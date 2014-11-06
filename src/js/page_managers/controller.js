define([
    "marionette",
    "hbs!./templates/results-page-layout",
    'hbs!./templates/results-control-row',
    'js/widgets/base/base_widget',
    './three_column_view'
  ],
  function (Marionette,
            pageTemplate,
            controlRowTemplate,
            BaseWidget,
            ThreeColumnView
            ) {

    var PageManagerController = BaseWidget.extend({

      initialize: function (options) {
        this.widgets = {};
        this.initialized = false;
      },

      createView: function(options) {
        return new ThreeColumnView(options);
      },

      activate: function (beehive) {
        this.pubsub = beehive.Services.get('PubSub');
        this.view = this.createView({debug : beehive.getDebug(), widgets: this.widgets});
        this.view.render();
      },

      assemble: function(app) {
        var that = this;
        _.each(_.keys(that.widgets), function(widgetName) {
          var widget = app.getWidget(widgetName);
          if (widget) {
            $(that.widgets[widgetName]).empty().append(widget.render().el);
            that.widgets[widgetName] = widget;
          }
          else {
            console.warn("Widget " + widgetName + " is not available (ignoring it)");
          }
        });
      },

      show: function(pageName) {
        if (this.widgets[pageName]) {
          this.view.$el.children().detach();

          //don't call render each time or else we
          //would have to re-delegate widget events
          this.view.$el.append(this.widgets[pageName].el);
          this.widgets[pageName].triggerMethod('show');
        }
      }
    });

    return PageManagerController;
  });