/**
 * A plugin to build interactive UI for the search. This plugin can be inserted into
 * any element on the page; and provides several methods for setting/getting state
 * of the form.
 *
 * Plugin itself does not communicate with API - but if you provide 'qtreeGetter'
 * that has methods 'getQTree', then it will parse query input automatically.
 *
 */

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


      initialize: function(options) {

        this._rules = null;
        this.rulesTranslator = new RulesTranslator();

        this.qtreeGetter = options.qtreeGetter || null;
        if (this.qtreeGetter && !this.qtreeGetter.getQTree) {
          throw new Error("qtreeGetter must provide method 'getQTree'");
        }

        if (options.el) {
          this.$el = $(options.el);
        }
        else {
          this.$el = $('<div/>');
        }

        $.fn.queryBuilder.defaults.set({
          conditions: ['AND', 'OR'],
          lang: {
            "defop_condition": "Space",

            "operator_is": "is",
            "operator_is_not": "is",
            "operator_is_exactly": "is exactly",

            "operator_contains": "has words",
            "operator_contains_not": "excludes words",

            "operator_is_wildcard": "starts with",
            "operator_is_not_wildcard": "doesn't start with",


            "operator_is_phrase": "has phrase",
            "operator_is_wildphrase": "has wildcard",
            "operator_is_not_phrase": "excludes phrase",
            "operator_is_not_empty": "is not empty",

            "operator_f_pos": "Limit by Position",
            "operator_f_citations": "Get Citations",
            "operator_f_references": "Get References",
            "operator_f_trending": "Find Trending Papers",
            "operator_f_instructive": "Find Instructive Papers"

          },
          operators: [
            {type: 'is',               accept_values: true,  apply_to: ['string', 'number', 'datetime']},
            {type: 'is_not',           accept_values: true,  apply_to: ['string', 'number', 'datetime']},
            {type: 'is_exactly',       accept_values: true,  apply_to: ['string', 'number', 'datetime']},

            {type: 'contains',         accept_values: true,  apply_to: ['string']},
            {type: 'contains_not',     accept_values: true,  apply_to: ['string']},
            {type: 'is_phrase',        accept_values: true,  apply_to: ['string']},
            {type: 'is_wildphrase',        accept_values: true,  apply_to: ['string']},
            {type: 'is_not_phrase',    accept_values: true,  apply_to: ['string']},

            {type: 'is_wildcard',      accept_values: true,  apply_to: ['string']},
            {type: 'is_not_wildcard',  accept_values: true,  apply_to: ['string']},

            {type: 'is_empty',         accept_values: false, apply_to: ['string']},
            {type: 'is_not_empty',     accept_values: false, apply_to: ['string']},

            {type: 'less',             accept_values: true,  apply_to: ['number', 'datetime']},
            {type: 'less_or_equal',    accept_values: true,  apply_to: ['number', 'datetime']},
            {type: 'greater',          accept_values: true,  apply_to: ['number', 'datetime']},
            {type: 'greater_or_equal', accept_values: true,  apply_to: ['number', 'datetime']},


            {type: 'f_pos',            accept_values: true, apply_to: ['string']},
            {type: 'f_citations',      accept_values: true, apply_to: ['string']},
            {type: 'f_references',     accept_values: true, apply_to: ['string']},
            {type: 'f_trending',       accept_values: true, apply_to: ['string']},
            {type: 'f_instructive',    accept_values: true, apply_to: ['string']}

          ]
        });

        var singleTokenOperators = ['is', 'is_wildcard', 'is_exactly', 'is_not', 'is_not_wildcard', 'is_not_empty'];
        var multiTokenOperators = ['contains', 'is_phrase', 'contains_not', 'is_not_phrase', 'is_not_empty', 'is_wildcard'];
        var functionOperators = ['is', 'is_not'];

        this.singleTokenOperators = singleTokenOperators;
        this.multiTokenOperators = multiTokenOperators;
        this.functionOperators = functionOperators;


        this.$el.queryBuilder({
          sortable: false,

          filters: [
            {id: 'author', label: 'Author', type: 'string', placeholder: 'Planck, Max',
              operators: singleTokenOperators, createOperatorIfNecessary: true},
            {id: '^author', label: 'First Author', type: 'string', placeholder: 'Einstein, A',
              operators: singleTokenOperators, createOperatorIfNecessary: true},
            {id: 'title', label: 'Title', type: 'string',
              operators: multiTokenOperators, createOperatorIfNecessary: true},
            {id: '__all__', label: 'Any Field', type: 'string',
              operators: multiTokenOperators, createOperatorIfNecessary: true},
            {id: 'abstract', label: 'Abstract', type: 'string',
              operators: multiTokenOperators, createOperatorIfNecessary: true},
            {id: 'keyword', label: 'Keyword', type: 'string',
              operators: singleTokenOperators, createOperatorIfNecessary: true},
            {id: 'full', label: 'Fulltext', type: 'string',
              operators: multiTokenOperators, createOperatorIfNecessary: true},
            {id: 'function', label: 'Function', type: 'string',
              operators: functionOperators, createOperatorIfNecessary: true},
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
        this._rules = rules;
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
        this._rules = null;
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

        return query || '';

      },



      /**
       * Converts qtree (as returned by SOLR query parser) into UI rules
       * (that can be used by the UI builder)
       *
       * @param qtree
       */
      getRulesFromQTree: function(qtree) {
        var rules = this.rulesTranslator.convertQTreeToRules(qtree);

        // we need to check/modify the rules to fit the constraints
        // that we are using
        return this.checkRulesConstraints(rules);
      },




      /**
       * The main logic to execute when we want to update the UI Query Builder
       * using *query string*
       *
       * It returns the promise object from the QTreeGetter
       *
       * @see: this.buildQTreeGetter
       */
      updateQueryBuilder: function(query) {

        if (!this.qtreeGetter) {
          throw new Error('You must provide qtreeGetter object for this to work');
        }

        var self = this;
        //first parse the query string into qtree
        return this.qtreeGetter.getQTree(query).done(function(qtree) {
          //translate qtree into 'rules'
          var rules = self.getRulesFromQTree(qtree);
          // and update the UI builder with them
          self.setRules(rules);
        });
      },

      /**
       * Check/modify the UI rules as extracted from the QTree
       * we'll add the specific logic, eg. that certain fields
       * can use only certain operators (even if the grammar
       * allows them to use all possible combinations)
       *
       * @param UIRules
       */
      checkRulesConstraints: function(UIRules) {
        this._checkRulesConstraints(UIRules);
        return UIRules;
      },

      _checkRulesConstraints: function(uiRules) {
        /*if (uiRules.field) {
          var m;
          if (m = this.operatorMap[uiRules.field]) {
            if (m[uiRules.operator]) {
              uiRules.operator = m[uiRules.operator];
            }
            else {
              throw new Error("Operator mapping is missing a value for:" + JSON.stringify(uiRules) + ' we have: ' + JSON.stringify(m));
            }
          }
        }*/

        if (uiRules.rules) {
          _.each(uiRules.rules, function(r) {
            this._checkRulesConstraints(r);
          }, this);
        }
      },


      /**
       * Returns true if the UI was changed (ie. user did something that changed the
       * original parse tree)
       *
       */
      isDirty: function() {
        try {
          if (this._rules && this.getQuery(this._rules) != this.getQuery()) {
            return true;
          }
        }
        catch(err) {
          console.trace(err);
          return true;
        }
        return false;
      },


      setQTreeGetter: function(getter) {
        this.qtreeGetter = getter;
      },

      /**
       * Attach a monitor to the UI - the callback will be called
       * once there is a change to the UI (ie. user initiated change)
       *
       * @param callback
       * @param delay
       */
      attachHeartBeat: function(callback, delay) {
        if (!delay) {
          delay = 100;
        }

        var throttled = _.debounce(callback, delay);

        this.$el.on('change.queryBuilder', function(ev) {
          throttled();
        });
        this.$el.on('click.queryBuilder', function(ev) {
          throttled();
        });
        this.$el.on('keypress.input', function(ev) {
          throttled();
        });
      }

    });

    /**
     * Convenience method to build a QTree getter object; it requires access
     * to the BeehIVE (PubSub)
     *
     * @param beehive
     */
    QueryBuilder.buildQTreeGetter = function(beehive) {

      var getter = function(beehive) {
        this.activate(beehive);
      };

      _.extend(getter.prototype, {

        activate: function(beehive) {
          this.pubsub = beehive.Services.get('PubSub');
          this.pubsub.subscribe(this.pubsub.DELIVERING_RESPONSE, _.bind(this.getResponse, this));
        },

        /**
         * Given an ApiQuery - asks SOLR to give us QTREE; this function
         * will return a promise. When the promise is resolved, the function
         * will receive ApiResponse
         *
         * @param query
         * @returns {Deferred}
         */
        getQTree: function(query) {
          this.promise = $.Deferred();
          this.pubsub.publish(this.pubsub.GET_QTREE, new ApiQuery({'q': query}));
          return this.promise;
        },

        /**
         * This function receives ApiResponse from the PubSub - usually as a
         * response to the request to parse a query.
         *
         * @param apiResponse
         */
        getResponse: function(apiResponse) {
          var qtree = JSON.parse(apiResponse.get('qtree'));
          if (this.promise && qtree) {
            this.promise.resolve(qtree);
          }
        }
      });

      return new getter(beehive);
    };

    return QueryBuilder;
  });