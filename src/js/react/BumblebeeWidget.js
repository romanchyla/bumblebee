// this module is not loaded directly, it must be loaded using reactify!
// in order for the view to be dynamically injected

define([
  'underscore',
  'js/widgets/base/base_widget',
  'js/components/api_request',
  'js/components/api_query',
  'analytics',
], function(_, BaseWidget, ApiRequest, ApiQuery, analytics) {
  const getBeeHive = () => {
    return window.bbb.getBeeHive();
  };

  const getPubSub = () => {
    const beehive = getBeeHive();
    const ps = beehive.getService('PubSub');
    return ps;
  };

  const subscribe = (...args) => {
    const ps = getPubSub();
    ps.subscribe(ps.pubSubKey, ...args);
  };

  const publish = (...args) => {
    const ps = getPubSub();
    ps.publish(ps.pubSubKey, ...args);
  };

  const BumblebeeWidget = BaseWidget.extend({
    initialize({ componentId, initialData }) {
      this.view.on({
        sendRequest: _.bind(this.onSendRequest, this),
        subscribeToPubSub: _.bind(this.subscribeToPubSub, this),
        publishToPubSub: _.bind(this.publishToPubSub, this),
        doSearch: _.bind(this.doSearch, this),
        getCurrentQuery: _.bind(this.onGetCurrentQuery, this),
        isLoggedIn: _.bind(this.isLoggedIn, this),
        getInitialData: _.bind(this.getInitialData, this),
        analyticsEvent: _.bind(this.analyticsEvent, this),
      });

      this.listenTo(this, 'page-manager-message', (ev, data) => {
        if (ev === 'widget-selected' && data.idAttribute === componentId) {
          this.view.destroy().render();
        }
      });
      this.initialData = initialData;
      this.activate();

      this.onSendRequest = _.debounce(this.onSendRequest, 1000, {
        leading: true,
        trailing: false,
      });
    },
    getInitialData(cb) {
      if (typeof cb === 'function') {
        cb(this.initialData);
      }
    },
    activate() {
      const ps = getPubSub();
      subscribe(ps.USER_ANNOUNCEMENT, this.handleUserAnnouncement.bind(this));
    },
    handleUserAnnouncement(event, data) {
      const user = getBeeHive().getObject('User');
      if (event == user.USER_SIGNED_IN) {
      } else if (event == user.USER_SIGNED_OUT) {
      }
    },
    isLoggedIn(cb) {
      const user = this.getBeeHive().getObject('User');
      if (typeof cb === 'function') {
        cb(user.isLoggedIn());
      }
    },
    onGetCurrentQuery(callback) {
      callback(this.getCurrentQuery());
    },
    subscribeToPubSub(event, callback) {
      const ps = getPubSub();
      subscribe(ps[event], callback);
    },
    publishToPubSub(event, ...args) {
      const ps = getPubSub();
      publish(ps[event], ...args);
    },
    doSearch(queryParams) {
      const query = new ApiQuery();
      _.isString(queryParams)
        ? query.load(queryParams)
        : query.set({ ...queryParams });
      this.publishToPubSub('NAVIGATE', 'search-page', {
        q: query,
      });
    },
    onSendRequest({ options, target, query }) {
      const ps = getPubSub();
      const request = new ApiRequest({
        target,
        query: new ApiQuery(query),
        options,
      });
      publish(ps.EXECUTE_REQUEST, request);
    },
    analyticsEvent(...args) {
      analytics(...args);
    },
  });

  return BumblebeeWidget;
});
