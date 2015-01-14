/**
 * This widget is capable of displaying messages to the user, however it does not
 * listen on the PubSub. It is invoked/controlled externally.
 */

define([
    'js/widgets/base/base_widget',
    'js/components/api_query',
    'hbs!./templates/carousel_template',
    'hbs!./templates/item-template',
    'marionette',
    'js/components/api_feedback',
    'jquery',
    'jquery-ui',
    'bootstrap'
  ],
  function(
    BaseWidget,
    ApiQuery,
    WidgetTemplate,
    ItemTemplate,
    Marionette,
    ApiFeedback,
    $,
    $ui,
    bootstrap
    ){

    var CarouselData = Backbone.Model.extend({
      defaults : {
        active: undefined,
        title: undefined,
        msg: undefined,
        mid: undefined
      }
    });

    var CarouselItem = Backbone.Model.extend({
      defaults : {
        caption: undefined,
        events: undefined,
        src: undefined
      }
    });

    var CarouselCollection = Backbone.Collection.extend({
      model : CarouselItem
    });

    var ItemView = Marionette.ItemView.extend({
      tagName: 'div',
      template : ItemTemplate,
      className: function () {
        if (this.model.get('active'))
          return "item active";
        else
          return "item";
      }
    });

    var delegateEventSplitter = /^(\S+)\s*(.*)$/;
    
    var WidgetView = Marionette.CompositeView.extend({
      template : WidgetTemplate,
      itemView : ItemView,
      itemViewContainer: "div.carousel-inner",

      events: {
        'click .close-widget': 'close'
      },

      modelEvents: {
        "change": 'render'
      },

      close: function() {
        this.collection.reset();
      },

      render: function() {
        if (this.$el) {
          this.$el.off('.customEvents' + this.mid);
        }
        Marionette.CompositeView.prototype.render.apply(this, arguments);
      },

      onRender: function() {
        var self = this;
        var events = this.model.get('events');

        // attach functions to events; copied from backbone
        // when 'event' is fired, it will call/resolve the
        // promise object with the name of the event
        if (events) {
          var bindings = {};
          _.each(events, function(evtValue, evt) {

            var match = evt.match(delegateEventSplitter);
            var eventName = match[1], selector = match[2];
            var key = evt;

            var method = function(ev) {
              if (ev) {
                ev.preventDefault();
                ev.stopPropagation();
              }
              var promise = this.model.get('promise');
              var evts = this.model.get('events');
              if (evts[key])
                promise.resolve(evts[key]);
              promise.resolve(key);
            };

            method = _.bind(method, self);
            eventName += '.customEvents' + this.mid;
            if (selector === '') {
              self.$el.on(eventName, method);
            } else {
              self.$el.on(eventName, selector, method);
            }
          });
        }
      }

    });


    var WidgetController = BaseWidget.extend({

      initialize: function (options) {
        this.model = options.model || new CarouselData();
        this.collection = options.collection || new CarouselCollection(options);
        this.view = options.view || new WidgetView(_.extend({model: this.model, collection: this.collection}, options));
        this.wid = _.uniqueId('widget');
      },

      activate: function (beehive) {
        //pass
      },

      carousel: function(options) {
        var promise = $.Deferred();
        var items = options.items;

        if (!items)
          throw new Error('Items cannot be empty');

        var active = _.filter(items, function(x) { return x.active });
        if (active.length == 0) {
          items[0].active = true;
        }

        var num = 0;
        var indicators = _.map(items, function(item) {
          item.no = num++;
          return {
            no: item.no,
            active: item.active ? 'active' : ''
          }
        });

        this.collection.reset(items);
        this.model.set({
          wid: this.wid,
          events: options.events,
          msg: options.msg,
          title: options.title,
          promise: promise,
          indicators: indicators
        });
        this.view.render();
        return promise.promise();
      }

    });


    return WidgetController;
  });