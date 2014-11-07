define([
    "marionette",
    "hbs!./templates/toc-page-layout",
    './controller',
    './three_column_view'
  ],
  function (Marionette,
            pageTemplate,
            BasicPageManagerController
    ) {

    var PageManagerController = BasicPageManagerController.extend({

      tocWidgetName : 'TOCWidget',
      tocTitleWidgeName: 'TOCTitleWidget',

      _updateTitle: function(currentWidget, titleWidget){
        var data = {};
        data.title = current.get("title");
        data.bibcode = current.get("bibcode");
        titleWidget.model.set(data);
      },

      show: function(pageName) {

        var self = this;
        _.each(this.widgets, function(w) {
          if (w.view && w.view.$el) {
            w.view.$el.detach();
          }
          else if (w.$el) {
            w.$el.detach();
          }
        });

        _.each(arguments, function(widgetName) {
          if (self.widgets[widgetName]) {
            var widget = self.widgets[widgetName];
            //this.view.$el.children().detach();

            //don't call render each time or else we
            //would have to re-delegate widget events
            self.view.$el.find('[data-widget="' + widgetName + '"]').append(widget.el ? widget.el : widget.view.el);
            self.widgets[widgetName].triggerMethod('show');

            // the the TOC widget
            var tocWidget = self.widgets[self.tocWidgetName];
            if (!tocWidget) {
              console.error('TOC widget is not available, we cannot update the menu view!');
            }
            else {
              //tocWidget.models.current = pageName;
            }

            if (self.widgets[self.tocTitleWidgeName]) {
              //this._updateTitle(this.widgets[pageName], this.widgets[this.tocTitleWidgeName]);
            }
          }
          else {
            console.error("Cannot show widget: " + widgetName + "(because, frankly... there is no such widget there!)");
          }
        });
        return this.view.el;
      }
    });

    return PageManagerController;
  });