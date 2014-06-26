

define([
  'underscore',
  'bootstrap',
  'jquery',
  'jquery-querybuilder',
  'js/components/generic_module',
  'js/components/query_builder/rules_translator',
  'js/components/api_query'
  ],

  function(
  _,
  Bootstrap,
  $,
  jQueryQueryBuilderPlugin,
  GenericModule,
  RulesTranslator,
  ApiQuery
  ) {

    var QueryBuilder = GenericModule.extend({
      activate: function(beehive) {
        this.pubsub = beehive.Services.get('PubSub');
        this.pubsub.subscribe(this.pubsub.DELIVERING_RESPONSE, _.bind(this.getResponse, this));
      },

      initialize: function(options) {

        this.rulesTranslator = new RulesTranslator();

        if (options.el) {
          this.$el = $(options.el);
        }
        else {
          this.$el = $('<div/>');
        }

        $.fn.queryBuilder.defaults.set({
          lang: {
            "operator_is_exactly": "is exactly",
            "operator_is": "is",
            "operator_is_not": "is not",
            "operator_starts_with": "starts with",
            "operator_starts_not_with": "doesn't start with",
            "operator_contains": "contains word(s)",
            "operator_contains_not": "doesn't contain word(s)",
            "operator_contains_phrase": "contains phrase",
            "operator_contains_not_phrase": "doesn't have phrase",
            "operator_is_not_empty": "is not empty",

            "operator_f_pos": "Limit by Position",
            "operator_f_citations": "Get Citations",
            "operator_f_references": "Get References",
            "operator_f_trending": "Find Trending Papers",
            "operator_f_instructive": "Find Instructive Papers"

          },
          operators: [
            {type: 'is',               accept_values: true,  apply_to: ['string', 'number', 'datetime']},
            {type: 'is_exactly',       accept_values: true,  apply_to: ['string', 'number', 'datetime']},
            {type: 'is_not',           accept_values: true,  apply_to: ['string', 'number', 'datetime']},
            {type: 'less',             accept_values: true,  apply_to: ['number', 'datetime']},
            {type: 'less_or_equal',    accept_values: true,  apply_to: ['number', 'datetime']},
            {type: 'greater',          accept_values: true,  apply_to: ['number', 'datetime']},
            {type: 'greater_or_equal', accept_values: true,  apply_to: ['number', 'datetime']},
            {type: 'starts_with',      accept_values: true,  apply_to: ['string']},
            {type: 'starts_not_with',  accept_values: true,  apply_to: ['string']},
            {type: 'contains',         accept_values: true,  apply_to: ['string']},
            {type: 'contains_not',     accept_values: true,  apply_to: ['string']},
            {type: 'contains_phrase',  accept_values: true,  apply_to: ['string']},
            {type: 'contains_not_phrase', accept_values: true,  apply_to: ['string']},
            {type: 'is_not_empty',     accept_values: false, apply_to: ['string']},

            {type: 'f_pos',            accept_values: true, apply_to: ['string']},
            {type: 'f_citations',      accept_values: true, apply_to: ['string']},
            {type: 'f_references',     accept_values: true, apply_to: ['string']},
            {type: 'f_trending',       accept_values: true, apply_to: ['string']},
            {type: 'f_instructive',    accept_values: true, apply_to: ['string']}

          ]
        });

        var singleTokenOperators = ['is', 'starts_with', 'is_exactly', 'is_not', 'starts_not_with', 'is_not_empty'];
        var multiTokenOperators = ['contains', 'contains_phrase', 'contains_not', 'contains_not_phrase', 'is_not_empty'];
        var functionOperators = ['is', 'is_not'];

        this.$el.queryBuilder({
          sortable: true,

          filters: [
            {id: 'author', label: 'Author', type: 'string', placeholder: 'Planck, Max',
              operators: singleTokenOperators},
            {id: '^author', label: 'First Author', type: 'string', placeholder: 'Einstein, A',
              operators: singleTokenOperators},
            {id: 'title', label: 'Title', type: 'string',
              operators: multiTokenOperators},
            {id: '__all__', label: 'Any Field', type: 'string',
              operators: multiTokenOperators},
            {id: 'abstract', label: 'Abstract', type: 'string',
              operators: multiTokenOperators},
            {id: 'keyword', label: 'Keyword', type: 'string',
              operators: singleTokenOperators},
            {id: 'full', label: 'Fulltext', type: 'string',
              operators: multiTokenOperators},
            {id: 'function', label: 'Function', type: 'string',
              operators: functionOperators},
            {id: 'f_pos', label: 'Match by Position()', type: 'string',
              operators: functionOperators,
              input: function($rule, filter) {
                var $container = $rule.find('.rule-value-container');



                return '\
      <input type="text" name="xxx" placeholder="author:&quot;Feynman, R&quot;">\
      start: <input type="text" name="xxx" size="3" placeholder="1">\
      end (optional): <input type="text" name="xxx" size="3" placeholder="2">\
      ';
              }
            },
            {id: 'f_citations', label: 'Find Citations()', type: 'string', placeholder: '&lt;any valid query&gt;',
              operators: functionOperators},
            {id: 'f_references', label: 'Find References()', type: 'string', placeholder: '&lt;any valid query&gt;',
              operators: functionOperators},
            {id: 'f_trending', label: 'Find Trending()', type: 'string', placeholder: '&lt;any valid query&gt;',
              operators: functionOperators},
            {id: 'f_instructive', label: 'Find Instructive()', type: 'string', placeholder: '&lt;any valid query&gt;',
              operators: functionOperators},
            {id: 'f_topn', label: 'Limit to TopN Results()', type: 'string',
              operators: functionOperators,
              input: function($rule, filter) {
                var $container = $rule.find('.rule-value-container');

                $container.on('change blur', '[name=arg]', function(){
                  var h = '';
                  var args = $container.find('[name=arg]');
                  var vals = new Array(args.length), $a;
                  for (var i= 0,l=args.length; i<l; i++) {
                    $a = $(args[i]);
                    vals[parseInt($a.attr('index'))] = $a.val();
                  }
                  $container.find('[name$=_value]').val(vals.join(', '));
                });

                return '\
                      <input type="text" name="arg" index="1" placeholder="&lt;any valid query&gt;">\
                      <select name="arg" index="2"> \
                        <option value="relevance">Relevance</option> \
                        <option value="citation_count desc">Citations (desc)</option> \
                        <option value="citation_count desc">Citations (asc)</option> \
                        <option value="pubdate desc">Date (desc)</option> \
                        <option value="pubdate desc">Date (asc)</option> \
                      </select> \
                      <input type="text" name="arg" index="0" size="3" placeholder="100">\
                      <input name="' + $rule.attr('id') + '_value" style="display:none;"></select>';
              }
            }
          ]
        });
      },


      /**
       * Utility method to load CSS into the page in which the plugin is used.
       */
      loadCss: function() {
        var url = require.toUrl('jquery-querybuilder') + '.css';

        if ($(document.getElementsByTagName("head")[0]).find('link[href=\''+url+'\']').length == 0) {
          var link = document.createElement("link");
          link.type = "text/css";
          link.rel = "stylesheet";
          link.href = url;
          document.getElementsByTagName("head")[0].appendChild(link);
        }
      },

      /**
       * Set the current state of the UI query builder
       *
       * @param rules
       */
      setRules: function(rules) {
        this.$el.queryBuilder('setRules', rules);
      },

      /**
       * Returns the rules as set inside the UI query builder
       *
       * @returns {*}
       */
      getRules: function() {
        return this.$el.queryBuilder('getRules');
      },

      /**
       * Resets the query builde UI
       */
      reset: function() {
        this.$el.queryBuilder('reset');
      },

      /**
       * Returns a query string as built from the UI rules. You
       * can supply the rules; or they will be taken from the
       * getRules()
       *
       * @returns {*}
       */
      getQuery: function(rules) {
        if (!rules)
          rules = this.getRules();
        var query = this.rulesTranslator.buildQuery(rules);

        // final modifications (removing some of the unnecessary details)
        return query.replace(' DEFOP ', ' ').replace('__all__:', '');
      },

      /**
       * Given an ApiQuery - asks SOLR to give us QTREE; this function
       * will return a promise. When the promise is resolved, the function
       * will receive ApiResponse
       *
       * @param query
       * @returns {*}
       */
      getQTree: function(query) {
        this.promise = $.Deferred();
        this.pubsub.publish(this.pubsub.GET_QTREE, new ApiQuery({'q': query}));
        return this.promise;
      },


      /**
       * Converts qtree (as returned by SOLR query parser) into UI rules
       * (that can be used by the UI builder)
       *
       * @param qtree
       */
      getRulesFromQTree: function(qtree) {
        return this.rulesTranslator.convertQTreeToRules(qtree);
      },

      /**
       * This function receives ApiResponse from the PubSub - usually as a
       * response to the request to parse a query.
       *
       * @param apiResponse
       */
      getResponse: function(apiResponse) {
        if (this.promise) {
          this.promise.resolve(apiResponse);
        }
      },


      /**
       * The main logic to execute when we want to update the UI Query Builder
       * using *query string*
       */
      updateQueryBuilder: function(query) {

        var self = this;
        //first parse the query string into qtree
        this.getQTree(query).done(function(apiResponse) {
          var qtree = JSON.parse(apiResponse.get('qtree'));
          // then translate qtree into 'rules'
          var rules = self.getRulesFromQTree(qtree);
          // and update the UI builder with them
          self.setRules(rules);
        });
      }

    });

    return QueryBuilder;
  });