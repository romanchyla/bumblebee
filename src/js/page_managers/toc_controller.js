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

        if (this.widgets[pageName]) {
          this.view.$el.children().detach();

          //don't call render each time or else we
          //would have to re-delegate widget events
          this.view.$el.append(this.widgets[pageName].el);
          this.widgets[pageName].triggerMethod('show');

          // the the TOC widget
          var tocWidget = this.widgets[this.tocWidgetName];
          if (!tocWidget) {
            console.error('TOC widget is not available, we cannot update the menu view!');
          }
          else {
            tocWidget.models.current = pageName;
          }

          if (this.widgets[this.tocTitleWidgeName]) {
            this._updateTitle(this.widgets[pageName], this.widgets[this.tocTitleWidgeName]);
          }
        }
        else {
          console.error("Cannot show widget: " + pageName + "(because, frankly... there is no such widget there!)");
        }
        return this.view.el;
      }
    });

    return PageManagerController;
  });