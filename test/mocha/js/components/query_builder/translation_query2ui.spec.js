define(['jquery',
  'underscore',
  'js/components/query_builder/plugin',
  'js/components/generic_module',
  'js/bugutils/minimal_pubsub'
], function ($, _, QueryBuilderPlugin, GenericModule, MinimalPubsub) {

  describe("QueryBuilder Query to UI (translation rules)", function () {


      var minsub, expectedQTree;
      beforeEach(function (done) {

        minsub = new (MinimalPubsub.extend({
          request: function (apiRequest) {
            var query = apiRequest.get('query');
            return {'responseHeader': {'status': 0, 'QTime': 0, params: query.toJSON()},
              'qtree': JSON.stringify(expectedQTree)};
          }
        }))({verbose: false});
        done();
      });

      afterEach(function (done) {
        minsub.close();
        var ta = $('#test');
        if (ta) {
          ta.empty();
        }
        done();
      });


      it("foo", function (done) {
        var p = new QueryBuilderPlugin(
          {qtreeGetter: QueryBuilderPlugin.buildQTreeGetter(minsub.beehive.getHardenedInstance())});


        expectedQTree = {"name": "OPERATOR", "label": "DEFOP", "children": [
          {"name": "MODIFIER", "label": "MODIFIER", "children": [
            {"name": "TMODIFIER", "label": "TMODIFIER", "children": [
              {"name": "FIELD", "label": "FIELD", "children": [
                {"name": "QNORMAL", "label": "QNORMAL", "children": [
                  {"name": "TERM_NORMAL", "input": "foo", "start": 0, "end": 2}
                ] }
              ] }
            ] }
          ] }
        ] };

        var promise = p.updateQueryBuilder("foo");

        promise.done(function (qtree) {
          var rules = p.getRulesFromQTree(qtree);

          var expected =
          {"rules": [
            {"id": "__all__", "field": "__all__", "type": "string", "operator": "is", "value": "foo"}
          ]};

          expect(rules).to.be.eql(expected);
          expect(p.getQuery(rules)).to.be.eql("foo");

          done();
        });

      });

      it("title:foo AND (bar OR bla)", function (done) {
        var p = new QueryBuilderPlugin(
          {qtreeGetter: QueryBuilderPlugin.buildQTreeGetter(minsub.beehive.getHardenedInstance())});


        expectedQTree = {"name": "OPERATOR", "label": "DEFOP", "children": [
          {"name": "OPERATOR", "label": "AND", "children": [
            {"name": "MODIFIER", "label": "MODIFIER", "children": [
              {"name": "TMODIFIER", "label": "TMODIFIER", "children": [
                {"name": "FIELD", "label": "FIELD", "children": [
                  {"name": "TERM_NORMAL", "input": "title", "start": 0, "end": 4},
                  {"name": "QNORMAL", "label": "QNORMAL", "children": [
                    {"name": "TERM_NORMAL", "input": "foo", "start": 6, "end": 8}
                  ] }
                ] }
              ] }
            ] },
            {"name": "CLAUSE", "label": "CLAUSE", "children": [
              {"name": "OPERATOR", "label": "DEFOP", "children": [
                {"name": "OPERATOR", "label": "OR", "children": [
                  {"name": "MODIFIER", "label": "MODIFIER", "children": [
                    {"name": "TMODIFIER", "label": "TMODIFIER", "children": [
                      {"name": "FIELD", "label": "FIELD", "children": [
                        {"name": "QNORMAL", "label": "QNORMAL", "children": [
                          {"name": "TERM_NORMAL", "input": "bar", "start": 15, "end": 17}
                        ] }
                      ] }
                    ] }
                  ] },
                  {"name": "MODIFIER", "label": "MODIFIER", "children": [
                    {"name": "TMODIFIER", "label": "TMODIFIER", "children": [
                      {"name": "FIELD", "label": "FIELD", "children": [
                        {"name": "QNORMAL", "label": "QNORMAL", "children": [
                          {"name": "TERM_NORMAL", "input": "bla", "start": 22, "end": 24}
                        ] }
                      ] }
                    ] }
                  ] }
                ] }
              ] }
            ] }
          ] }
        ] };

        var promise = p.updateQueryBuilder("title:foo AND (bar OR bla)");

        promise.done(function (qtree) {
          var rules = p.getRulesFromQTree(qtree);

          var expected =
          {"condition": "AND", "rules": [
            {"id": "title", "field": "title", "type": "string", "operator": "is", "value": "foo"},
            {"condition": "OR", "rules": [
              {"id": "__all__", "field": "__all__", "type": "string", "operator": "is", "value": "bar"},
              {"id": "__all__", "field": "__all__", "type": "string", "operator": "is", "value": "bla"}
            ]}
          ]};

          expect(rules).to.be.eql(expected);
          expect(p.getQuery(rules)).to.be.eql("title:foo AND (bar OR bla)");

          done();
        });

      });


      it("title:(foo bar)", function (done) {
        var p = new QueryBuilderPlugin(
          {qtreeGetter: QueryBuilderPlugin.buildQTreeGetter(minsub.beehive.getHardenedInstance())});


        expectedQTree = {"name": "OPERATOR", "label": "DEFOP", "children": [
          {"name": "MODIFIER", "label": "MODIFIER", "children": [
            {"name": "TMODIFIER", "label": "TMODIFIER", "children": [
              {"name": "FIELD", "label": "FIELD", "children": [
                {"name": "TERM_NORMAL", "input": "title", "start": 0, "end": 4},
                {"name": "CLAUSE", "label": "CLAUSE", "children": [
                  {"name": "OPERATOR", "label": "DEFOP", "children": [
                    {"name": "MODIFIER", "label": "MODIFIER", "children": [
                      {"name": "TMODIFIER", "label": "TMODIFIER", "children": [
                        {"name": "FIELD", "label": "FIELD", "children": [
                          {"name": "QNORMAL", "label": "QNORMAL", "children": [
                            {"name": "TERM_NORMAL", "input": "foo", "start": 7, "end": 9}
                          ] }
                        ] }
                      ] }
                    ] },
                    {"name": "MODIFIER", "label": "MODIFIER", "children": [
                      {"name": "TMODIFIER", "label": "TMODIFIER", "children": [
                        {"name": "FIELD", "label": "FIELD", "children": [
                          {"name": "QNORMAL", "label": "QNORMAL", "children": [
                            {"name": "TERM_NORMAL", "input": "bar", "start": 11, "end": 13}
                          ] }
                        ] }
                      ] }
                    ] }
                  ] }
                ] }
              ] }
            ] }
          ] }
        ] };

        var promise = p.updateQueryBuilder("title:(foo bar)");

        promise.done(function (qtree) {
          var rules = p.getRulesFromQTree(qtree);

          var expected =
          {"rules": [
            {"id": "title", "field": "title", "type": "string", "operator": "contains", "value": "foo bar"}
          ]};

          expect(rules).to.be.eql(expected);
          expect(p.getQuery(rules)).to.be.eql("title:(foo bar)");

          done();
        });

      });
    }
  );
});