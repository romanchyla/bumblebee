
define(['jquery',
  'underscore',
  'js/components/query_builder/rules_translator',
  'js/components/generic_module'
], function(
  $,
  _,
  RulesTranslator,
  GenericModule) {

  describe("QueryBuilder - Rule Translator (component)", function () {


      it("qtree -> rules", function() {

        var t = new RulesTranslator();

        var qtree = {"name":"OPERATOR", "label":"DEFOP", "children": [
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

        var rules = t.convertQTreeToRules(qtree);
        //console.log(JSON.stringify(rules))
        expect(rules).to.eql({"condition":"DEFOP","rules":[{"id":"title","field":"title","type":"string","operator":"contains","value":"joe"},{"id":"__all__","field":"__all__","type":"string","operator":"contains","value":"doe"}]});
      });


    }
  );
});