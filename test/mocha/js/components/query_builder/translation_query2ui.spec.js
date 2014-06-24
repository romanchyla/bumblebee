
define(['jquery',
  'underscore',
  'js/components/query_builder/plugin',
  'js/components/generic_module',
  'js/bugutils/minimal_pubsub'
], function(
  $,
  _,
  QueryBuilderPlugin,
  GenericModule,
  MinimalPubsub) {

  describe("QueryBuilder Query to UI (translation rules)", function () {


      var minsub, expected;
      beforeEach(function(done) {

        minsub = new (MinimalPubsub.extend({
          request: function(apiRequest) {
            var query = apiRequest.get('query');
            return {'responseHeader': {'status': 0, 'QTime': 0, params: query.toJSON()},
              'qtree': expected};
          }
        }))({verbose: false});
        done();
      });

      afterEach(function(done) {
        minsub.close();
        var ta = $('#test');
        if (ta) {
          ta.empty();
        }
        done();
      });


      it("query #1", function() {
        var p = new QueryBuilderPlugin();
        p.activate(minsub.beehive.getHardenedInstance());


        expected = {"name":"OPERATOR", "label":"DEFOP", "children": [
          {"name":"MODIFIER", "label":"MODIFIER", "children": [
            {"name":"TMODIFIER", "label":"TMODIFIER", "children": [
              {"name":"FIELD", "label":"FIELD", "children": [
                {"name":"TERM_NORMAL", "input":"title", "start":0, "end":4},
                {"name":"QNORMAL", "label":"QNORMAL", "children": [
                  {"name":"TERM_NORMAL", "input":"joe", "start":6, "end":8}]
                }]
              }]
            }]
          },
          {"name":"MODIFIER", "label":"MODIFIER", "children": [
            {"name":"TMODIFIER", "label":"TMODIFIER", "children": [
              {"name":"FIELD", "label":"FIELD", "children": [
                {"name":"QNORMAL", "label":"QNORMAL", "children": [
                  {"name":"TERM_NORMAL", "input":"doe", "start":10, "end":12}]
                }]
              }]
            }]
          }]
        };

        var promise = p.getQTree("author:Roman AND (title:galaxy OR abstract:42)");

        promise.done(function(apiResponse) {
          var qtree = JSON.parse(apiResponse.get('qtree'));
          expect(qtree).to.be.eql(expected);
          done();
        });

      });



    }
  );
});