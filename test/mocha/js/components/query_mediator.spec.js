/**
 * Created by rchyla on 3/31/14.
 */

define([
    'underscore',
    'jquery',
    'js/components/query_mediator',
    'js/components/beehive',
    'js/services/pubsub',
    'js/services/api',
    'js/components/generic_module',
    'js/components/pubsub_key',
    'js/components/api_query',
    'js/components/api_request',
    'js/components/pubsub_events',
    'js/components/api_feedback'
     ],
  function(
    _,
    $,
    QueryMediator,
    BeeHive,
    PubSub,
    Api,
    GenericModule,
    PubSubKey,
    ApiQuery,
    ApiRequest,
    PubSubEvents,
    ApiFeedback
    ) {

    var beehive, debug = false, pubSpy;
    describe('Query Mediator (Scaffolding)', function() {


      beforeEach(function(done) {
        this.server = sinon.fakeServer.create();
        this.server.autoRespond = true;
        //this.server.async = false;
        //this.server.respondWith(/\/api\/1\/search.*/,
        //  [200, { "Content-Type": "application/json" }, validResponse]);
        //this.server.respondWith(/\/api\/1\/error.*/,
        //  [502, { "Content-Type": "application/json" }, validResponse]);

        this.server.respondWith(function(req) {
          console.log(req.url);
          if (req.url.indexOf('/api/1/error') > -1) {
            req.respond(505, { "Content-Type": "application/json" }, validResponse);
            return;
          }

          req.respond(200, { "Content-Type": "application/json" }, validResponse);
        });

        beehive = new BeeHive();
        var api = new Api();
        sinon.spy(api, 'request');
        beehive.addService('Api', api);
        var ps = new PubSub();
        pubSpy = sinon.spy();
        ps.on('all', pubSpy);
        beehive.addService('PubSub', ps);
        done();
      });

      afterEach(function(done) {
        console.log('closing')
        beehive.close();
        beehive = null;
        this.server.restore();
        done();
      });

      it("returns QueryMediator object", function(done) {
        expect(new QueryMediator()).to.be.instanceof(QueryMediator);
        expect(new QueryMediator()).to.be.instanceof(GenericModule);
        done();
      });

      it.skip("has 'activate' and 'activateCache' function - which does the appropriate setup", function(done) {
        var qm = new QueryMediator();
        var pubsub = beehive.Services.get('PubSub');

        sinon.stub(pubsub, 'subscribe');
        qm.activate(beehive);

        expect(qm.hasBeeHive()).to.be.true;
        expect(qm.getBeeHive()).to.be.equal(beehive);
        expect(qm.pubSubKey).to.be.instanceof(PubSubKey);

        expect(pubsub.subscribe.callCount).to.be.eql(4);
        expect(pubsub.subscribe.args[0].slice(0,2)).to.be.eql([qm.pubSubKey, pubsub.START_SEARCH]);
        expect(pubsub.subscribe.args[1].slice(0,2)).to.be.eql([qm.pubSubKey, pubsub.DELIVERING_REQUEST]);

        expect(qm._cache).to.be.undefined;
        qm.activateCache();
        expect(qm._cache).to.be.defined;

        done();
      });

      it("should mediate between modules; passing data back and forth", function(done) {
        var qm = new QueryMediator({'debug': debug});
        qm.activate(beehive);

        // install spies into pubsub and api
        var pubsub = beehive.Services.get('PubSub');
        var pubsubSpy = sinon.spy(function(){if (debug) {console.log('[pubsub:all]', arguments)}});
        pubsub.on('all', pubsubSpy);
        var api = beehive.Services.get('Api');
        var apiSpy = sinon.spy(function(){if (debug) {console.log('[api:all]', arguments)}});
        api.on('all', apiSpy);

        // test counter for number of responses received
        var globalCounter = 0;

        // create fake UI widgets that simulate interaction with mediator
        // they send signals and receive responses
        var M = GenericModule.extend({
          activate: function(beehive) {
            this.bee = beehive;
            pubsub = beehive.Services.get('PubSub');
            pubsub.subscribe(pubsub.INVITING_REQUEST, _.bind(this.sendRequest, this));
            pubsub.subscribe(pubsub.DELIVERING_RESPONSE, _.bind(this.receiveResponse, this));
          },
          userAction: function(q) {
            if (debug)
              console.log('[' + this.mid + '] User Action:', q.url());
            var pubsub = this.bee.Services.get('PubSub');
            pubsub.publish(pubsub.START_SEARCH, q);
          },
          sendRequest: function(q) {
            q = q.clone();
            q.unlock();
            q.add('q', 'field:' + this.mid);
            var pubsub = this.bee.Services.get('PubSub');
            var r = new ApiRequest({target: 'search', query:q});

            if (debug)
              console.log('[' + this.mid + '] Returning Request:', r.url());
            pubsub.publish(pubsub.DELIVERING_REQUEST, r);
            this._q = q;
          },
          receiveResponse: function(r) {
            if (debug)
              console.log('[' + this.mid + '] Receiving Response:', JSON.stringify(r.toJSON()));

            // do something with response...
            expect(r.get('responseHeader.QTime')).to.equal(88);
            // check the query was the same
            expect(r.getApiQuery().url()).to.equal(this._q.url());
            // actually, even the same instance
            expect(r.getApiQuery()).to.equal(this._q);

            globalCounter += 1;
            if (globalCounter > 1) {
              if (debug)
                console.log('test: closing');
              checkIt();
              done();
            }
          }
        });

        // create components
        var m1 = new M();
        var m2 = new M();

        // install spies into components
        sinon.spy(m1, 'sendRequest', m1.sendRequest);
        sinon.spy(m1, 'receiveResponse', m1.receiveResponse);
        sinon.spy(m2, 'sendRequest', m2.sendRequest);
        sinon.spy(m2, 'receiveResponse', m2.receiveResponse);

        // because of the spies, we must activate only now...
        m1.activate(beehive.getHardenedInstance());
        m2.activate(beehive.getHardenedInstance());

        // pretend user clicked and a new query is fired
        var q = new ApiQuery({'q': '*:*'});
        m1.userAction(q);

        /*
         whole chain of events should happen:
         - user clicked: START_SEARCH
         - mediator issues: INVITING_REQUEST
           - m1 and m2 respond with: DELIVERING_REQUEST
         - mediator collects requests
           - mediator tests the first query
           - mediator calls api: api.request(apiRequest)
             - api gets data and sends them back to mediator
             - mediator wraps it into ApiResponse and issues: DELIVERING_RESPONSE
                - m1 & m2 receive the apiResponse (each for their own request only)
        */

        // must be called after we have collected everything
        var checkIt = function() {
          // each was called once
          expect(m1.sendRequest.callCount).to.be.equal(1);
          expect(m2.sendRequest.callCount).to.be.equal(1);

          // they received a clone of the query (but not the original)
          expect(m1.sendRequest.args[0][0].url()).to.equal(q.url());
          expect(m2.sendRequest.args[0][0].url()).to.equal(q.url());
          expect(m1.sendRequest.args[0][0]).to.not.equal(q);
          expect(m2.sendRequest.args[0][0]).to.not.equal(q);
          // and it was 'locked'
          expect(m1.sendRequest.args[0][0].isLocked()).to.be.true;
          expect(m2.sendRequest.args[0][0].isLocked()).to.be.true;

          // each UI must receive only its own data
          expect(m1.receiveResponse.callCount).to.be.equal(1);
          expect(m2.receiveResponse.callCount).to.be.equal(1);
        };

        if (debug)
          console.log('test: reached end');
      });

      it("has _getCacheKey function", function(done) {
        var qm = new QueryMediator();
        var req = new ApiRequest({target: 'search', query:new ApiQuery({'q': 'pluto'})});

        req.get('query').set('__x', 'foo');
        expect(req.url()).to.be.equal('search?__x=foo&q=pluto');
        var key = qm._getCacheKey(req);
        expect(req.url()).to.be.equal('search?__x=foo&q=pluto');
        expect(key).to.be.equal('search?q=pluto');
        done();
      });

      it("has START_SEARCH signal", function(done) {
        var qm = new QueryMediator({
          shortDelayInMs: 2
        });
        qm.activate(beehive);

        sinon.spy(qm, 'reset');
        sinon.spy(qm, 'startExecutingQueries');
        sinon.spy(qm, 'monitorExecution');

        var pubsub = beehive.Services.get('PubSub');
        var key = pubsub.getPubSubKey();

        qm._cache.put('foo', 'bar');
        qm.startSearchCycle(new ApiQuery({'q': 'foo'}), key);

        expect(qm._cache.size).to.be.eql(0);
        expect(qm.reset.called).to.be.true;
        expect(qm.__searchCycle.initiator).to.be.eql(key.getId());
        expect(qm.__searchCycle.waiting[key.getId()]).to.be.defined;
        expect(pubSpy.lastCall.args[0]).to.be.eql(PubSubEvents.INVITING_REQUEST);

        expect(qm.monitorExecution.called).to.be.false;
        setTimeout(function() {
          expect(qm.startExecutingQueries.called).to.be.true;
          expect(qm.monitorExecution.called).to.be.true;
          done();
        }, 5);

      });

      var createTestQM = function() {
        var qm = new QueryMediator({
          shortDelayInMs: 2
        });

        var pubsub = beehive.Services.get('PubSub');
        var key1 = pubsub.getPubSubKey();
        var key2 = pubsub.getPubSubKey();
        var q1 = new ApiQuery({'q': 'foo'});
        var q2 = new ApiQuery({'q': 'bar'});
        var req1 = new ApiRequest({target: 'search', query: q1});
        var req2 = new ApiRequest({target: 'search', query: q2});

        sinon.spy(qm, 'reset');
        sinon.spy(qm, '_executeRequest');
        sinon.spy(qm, 'monitorExecution');
        sinon.spy(qm, 'onApiResponse');
        sinon.spy(qm, 'onApiRequestFailure');

        qm.activate(beehive);
        return {qm: qm, key1: key1, key2:key2, req1: req1, req2:req2, q1:q1, q2:q2, pubsub:pubsub}
      };

      it("executes queries", function(done) {

        var x = createTestQM();
        var qm = x.qm, key1 = x.key1, key2 = x.key2, req1 = x.req1, req2 = x.req2;

        qm.__searchCycle.running = true;
        qm.startExecutingQueries();
        expect(qm._executeRequest.called).to.be.false;

        qm.__searchCycle.running = false;
        qm.startExecutingQueries();
        expect(qm._executeRequest.called).to.be.false;


        qm.__searchCycle.waiting[key1.getId()] = {key: key1, request: req1};
        qm.__searchCycle.waiting[key2.getId()] = {key: key2, request: req2};
        qm.startExecutingQueries();
        expect(qm.__searchCycle.running).to.be.true;
        expect(qm.__searchCycle.inprogress[key1.getId()]).to.be.defined;
        expect(qm._executeRequest.callCount).to.be.eql(1);
        expect(qm.onApiResponse.callCount).to.be.eql(0);

        setTimeout(function() {
          expect(pubSpy.firstCall.args[0]).to.be.eql(PubSubEvents.DELIVERING_RESPONSE + key1.getId());
          expect(pubSpy.secondCall.args[0]).to.be.eql(PubSubEvents.FEEDBACK);
          expect(pubSpy.secondCall.args[1].code).to.be.eql(ApiFeedback.CODES.SEARCH_CYCLE_STARTED);

          expect(qm._executeRequest.callCount).to.be.eql(2);
          expect(qm.onApiResponse.callCount).to.be.eql(2);

          done();
        }, 50);

      });

      it("executes queries (first, the one we want)", function() {

        var x = createTestQM();
        var qm = x.qm, key1 = x.key1, key2 = x.key2, req1 = x.req1, req2 = x.req2;

        beehive.addObject('RuntimeConfig', {pskToExecuteFirst: key2.getId()});
        qm.__searchCycle.waiting[key1.getId()] = {key: key1, request: req1};
        qm.__searchCycle.waiting[key2.getId()] = {key: key2, request: req2};
        qm.startExecutingQueries();
        expect(qm.__searchCycle.running).to.be.true;
        expect(qm.__searchCycle.inprogress[key2.getId()]).to.be.defined;

      });

      it("when error happens on the first query, it stops execution and triggers Feedback", function(done) {

        var x = createTestQM();
        var qm = x.qm, key1 = x.key1, key2 = x.key2, req1 = x.req1, req2 = x.req2;


        this.server.autoRespond = false;

        req1.set('target', 'error');
        beehive.addObject('RuntimeConfig', {pskToExecuteFirst: key1.getId()});
        qm.__searchCycle.waiting[key1.getId()] = {key: key1, request: req1};
        qm.__searchCycle.waiting[key2.getId()] = {key: key2, request: req2};

        qm.startExecutingQueries();
        expect(qm._executeRequest.callCount).to.be.eql(1);
        expect(qm.onApiResponse.callCount).to.be.eql(0);

        this.server.respond();
        this.server.respond();

        setTimeout(function() {
          expect(pubSpy.firstCall.args[0].code).to.be.eql(ApiFeedback.CODES.SEARCH_CYCLE_FAILED_TO_START);

          expect(qm._executeRequest.callCount).to.be.eql(1);
          expect(qm.onApiRequestFailure.callCount).to.be.eql(1);

          done();
        }, 50);

      });

      it.skip("should use cache (if configured)", function(done) {
        var qm = new QueryMediator({
          cache: {},
          debug:true,
          monitoringDelayInMs: 5,
          shortDelayInMs: 1,
          longDelayInMs: 2
        });
        var pubsub = beehive.Services.get('PubSub');
        var key = pubsub.getPubSubKey();
        var key2 = pubsub.getPubSubKey();

        sinon.spy(pubsub, 'subscribe');
        sinon.spy(qm, 'onApiResponse');
        sinon.spy(qm, 'onApiRequestFailure');

        var api = beehive.Services.get('Api');

        var reset = function() {
          api.request.reset();
          pubsub.subscribe.reset();
          qm.onApiResponse.reset();
          qm.onApiRequestFailure.reset();
          qm.reset();
        };

        qm.activate(beehive);

        var q = new ApiQuery({'q': 'pluto'});
        var req = new ApiRequest({target: 'search', query:q});

        qm.receiveRequests(req, key);
        qm.receiveRequests(req, key2);
        qm.startExecutingQueries();

        var self = this;

        setTimeout(function() {
          expect(qm.onApiResponse.callCount, 2);
          expect(api.request.callCount).to.be.equal(1); // only one because the queries are identical


          reset();
          for (var i = 0; i < 10; i++) {
            qm.receiveRequests(req, pubsub.getPubSubKey());
          }
          qm.startExecutingQueries();


          setTimeout(function() {
            expect(qm.onApiResponse.callCount, 10);
            expect(api.request.callCount).to.be.equal(1);


            reset();
            q.set('__boo', 'hey');
            qm.receiveRequests(req, key);
            qm.receiveRequests(req, key2);
            qm.startExecutingQueries();

            setTimeout(function() {

              expect(qm.onApiResponse.callCount, 2);
              expect(api.request.callCount).to.be.equal(1);

              reset();
              // two differnt queries

              var c = req.clone();
              var q2 = q.clone();
              q2.set('fq', 'hey')
              c.set('query', q2);
              qm.receiveRequests(req, key);
              qm.receiveRequests(c, key2);
              qm.startExecutingQueries();

              setTimeout(function() {

                expect(qm.onApiResponse.callCount, 2);
                expect(api.request.callCount).to.be.equal(2);

                reset();

                // now try errors, errors should not be cached
                self.server.respond();
                self.server.responses[0].response[0] = 502;
                //this.server.respondWith(/\/api\/1\/search.*/,
                //  [503, { "Content-Type": "application/json" }, validResponse]);


                qm.receiveRequests(req, key);
                qm.receiveRequests(req, key2);
                qm.startExecutingQueries();

                setTimeout(function() {


                  expect(qm.onApiResponse.callCount, 0);
                  expect(qm.onApiRequestFailure.callCount, 1);
                  expect(api.request.callCount).to.be.equal(1);

                  self.server.respond();
                  //this.server.respondWith(/\/api\/1\/search.*/,
                  //  [200, { "Content-Type": "application/json" }, validResponse]);
                  self.server.responses[0].response[0] = 200;

                  qm.receiveRequests(req, key2);
                  self.server.respond();
                  expect(qm.onApiResponse.callCount, 15);
                  expect(qm.onApiRequestFailure.callCount, 1);
                  expect(api.request.callCount).to.be.equal(2);

                  // but this this will be served from  cache
                  qm.receiveRequests(req, key);
                  self.server.respond();
                  expect(qm.onApiResponse.callCount, 16);
                  expect(qm.onApiRequestFailure.callCount, 1);
                  expect(api.request.callCount).to.be.equal(2);


                  // constant failures should trigger safety mechanism of max-retries
                  self.server.responses[0].response[0] = 502;
                  q.set('fq', 'ha');
                  qm.onApiResponse.reset();
                  qm.onApiRequestFailure.reset();
                  api.request.reset();

                  for (var i = 0; i < 3; i++) {
                    qm.receiveRequests(req, key2);
                    this.server.respond();
                    expect(qm.onApiResponse.callCount, 0);
                    expect(qm.onApiRequestFailure.callCount, i + 1);
                    expect(api.request.callCount).to.be.equal(i + 1);
                  }

                  for (var i = 0; i < 3; i++) {
                    qm.receiveRequests(req, key2);
                    this.server.respond();
                    expect(qm.onApiResponse.callCount, 0);
                    expect(qm.onApiRequestFailure.callCount, 4 + i);
                    expect(api.request.callCount).to.be.equal(3);
                  }

                  done();
                }, 20);
              }, 20);
            }, 20);
          }, 20);
        }, 20);
      });

      it.skip("knows to recover from certain error situations (such as hangup)", function(done) {
        var qm = new QueryMediator({cache: true, debug:false, recoveryDelayInMs: 50});
        var pubsub = beehive.Services.get('PubSub');
        var api = beehive.Services.get('Api');

        var key = pubsub.getPubSubKey();
        var key2 = pubsub.getPubSubKey();

        sinon.spy(qm, 'onApiResponse');
        sinon.spy(qm, 'onApiRequestFailure');
        sinon.spy(qm, 'tryToRecover');

        qm.activate(beehive);

        this.server.autoRespond = false;

        var q = new ApiQuery({'q': 'pluto'});
        var req = new ApiRequest({target: 'search', query:q});

        this.server.responses[0].response[0] = 503;
        qm.receiveRequests(req, key);
        this.server.respond(); // first request

        expect(api.request.callCount).to.be.equal(1);
        expect(qm.onApiResponse.callCount, 0);
        expect(qm.onApiRequestFailure.callCount, 1);
        expect(qm.tryToRecover.callCount, 1);

        this.server.respond(); // first re-try
        var self = this;

        setTimeout(function() {

          expect(api.request.callCount).to.be.equal(2);
          expect(qm.onApiResponse.callCount, 0);
          expect(qm.onApiRequestFailure.callCount, 2);
          expect(qm.tryToRecover.callCount, 2);

          self.server.respond(); // second re-try

          setTimeout(function() {
            expect(api.request.callCount).to.be.equal(3);
            expect(qm.onApiResponse.callCount, 0);
            expect(qm.onApiRequestFailure.callCount, 3);
            expect(qm.tryToRecover.callCount, 3);

            self.server.respond(); // all next requests should be ignored
            self.server.respond(); // all next requests should be ignored

            expect(api.request.callCount).to.be.equal(3);
            expect(qm.onApiResponse.callCount, 0);
            expect(qm.onApiRequestFailure.callCount, 5);
            expect(qm.tryToRecover.callCount, 3);

            qm.close();
            delete qm;
            
            done();
          }, 50);

        }, 50);


      });
    });


    var validResponse = '{\
      "responseHeader":{\
        "status":0,\
          "QTime":88,\
          "params":{\
          "facet":"true",\
            "indent":"true",\
            "hl.simple.pre":"<em>",\
            "hl.fl":"title",\
            "wt":"json",\
            "hl":"true",\
            "rows":"5",\
            "fl":"title,bibcode,author",\
            "start":"10",\
            "facet.query":"title:star",\
            "q":"title:star",\
            "hl.simple.post":"</em>",\
            "facet.field":"author",\
            "fq":"database:astronomy"}},\
      "response":{"numFound":172978,"start":10,"docs":[\
        {\
          "author":["Morrison, J."],\
          "bibcode":"1903PA.....11...88M",\
          "title":["The Star of Bethlehem"]},\
        {\
          "author":["Morrison, J."],\
          "bibcode":"1903PA.....11..122M",\
          "title":["The Star of Bethlehem (cont.)"]},\
        {\
          "author":["Wing, Daniel E."],\
          "bibcode":"1903PA.....11..481W",\
          "title":["Star Dust"]},\
        {\
          "bibcode":"1906PA.....14R.507.",\
          "title":["Star Charts"]},\
        {\
          "author":["Holmes, Edwin"],\
          "bibcode":"1894JBAA....5...26H",\
          "title":["Star Streams"]}]\
      },\
      "facet_counts":{\
        "facet_queries":{\
          "title:star":172978},\
        "facet_fields":{\
          "author":[\
            "heber, u",301,\
            "linsky, j l",299,\
            "mayor, m",273,\
            "kurtz, d w",270,\
            "pickering, edward c",262,\
            "maeder, a",260,\
            "schmitt, j h m m",259,\
            "campbell, leon",256,\
            "mundt, r",138]},\
        "facet_dates":{},\
        "facet_ranges":{}},\
      "highlighting":{\
        "166243":{\
          "title":["The <em>Star</em> of Bethlehem"]},\
        "166285":{\
          "title":["The <em>Star</em> of Bethlehem (cont.)"]},\
        "166785":{\
          "title":["<em>Star</em> Dust"]},\
        "192734":{\
          "title":["<em>Star</em> Charts"]},\
        "139757":{\
          "title":["<em>Star</em> Streams"]}}}';

});
