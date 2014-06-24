/**
 * Created by rchyla on 6/23/14.
 */

define(['underscore',
    'js/components/generic_module',
    'js/components/api_query_updater'],
  function (_,
            GenericModule,
            ApiQueryUpdater) {


    var TreeNode = function (operator, value) {
      this.operator = operator;
      this.value = value;
      this.children = [];
    };
    TreeNode.prototype.addChild = function (childNode) {
      this.children.push(childNode);
    };
    TreeNode.prototype.addChildren = function (childNodes) {
      this.children = _.union(this.children, childNodes);
    };
    TreeNode.prototype.toString = function (level) {
      if (_.isUndefined(level))
        level = 0; // root

      if (this.value) { // leaf node
        return this.value;
      }

      var queries = [];
      _.each(this.children, function (child, index, list) {
        queries.push(child.toString(level+1));
      });

      var q = queries.join(' ' + this.operator + ' ');
      if (level > 0)
        q = "(" + q + ")";
      return q;
    };


    var RulesTranslator = GenericModule.extend({
      initialize: function(options) {
        this.apiQueryUpdater = new ApiQueryUpdater('rulesTranslator');
      },

      buildQuery: function (rules) {

        if (rules.rules) {
          var root = new TreeNode(rules.condition);
          var tree = this._buildQueryTree(root, rules.rules);
          if (tree) {
            return tree.toString();
          }
          return '';
        }
      },

      _buildQueryTree: function (treeNode, rules) {
        var self = this;
        if (rules && rules.length > 0) {
          _.each(rules, function(rule){
            if (rule.condition) {
              var node = new TreeNode(rule.condition);
              treeNode.addChild(node);
              self._buildQueryTree(node, rule.rules);
            }
            else {
              var node = self._buildOneRule(rule);
              if (node) {
                treeNode.addChild(node);
              }
            }
          });
        }
        return treeNode;
      },

      _buildOneRule: function(rule) {
        var val, q, field;
        if (rule.type == 'string') {
          var input = rule.value.trim();
          switch(rule.operator) {
            case 'is':
            case 'is_not':
              field = rule.field;
              val = this.apiQueryUpdater.quoteIfNecessary(input);
              if (field) {
                q = field + ':' + val;
              }
              else {
                q = val;
              }
              if (rule.operator.indexOf('_not') > -1)
                q = '-' + q;
              break;
            case 'contains':
            case 'contains_not':
              field = rule.field;
              val = this.apiQueryUpdater.quoteIfNecessary(input, '(', ')');
              if (field) {
                q = field + ':' + val;
              }
              else {
                q = val;
              }
              if (rule.operator.indexOf('_not') > -1)
                q = '-' + q;
              break;
            case 'is_exactly':
            case 'is_not_exactly':
              field = rule.field || 'all';
              q = '=' + field + ':' + this.apiQueryUpdater.quoteIfNecessary(input);
              if (rule.operator.indexOf('_not_') > -1)
                q = 'NOT ' + q;
              break;
            case 'starts_with':
            case 'starts_not_with':
              field = rule.field || 'all';
              if (input.indexOf('*') > -1) { // user input contains '*' - they should know what they do
                input = this.apiQueryUpdater.quoteIfNecessary(input);
              }
              else {
                var newInput = this.apiQueryUpdater.quoteIfNecessary(input);
                if (newInput.length != input.length) {
                  input = newInput.substring(0, newInput.length-1) + "*\"";
                }
                else {
                  input += '*';
                }
              }

              q = field + ':' + input;
              if (rule.operator.indexOf('_not_') > -1)
                q = '-' + q;
              break;


            default:
              throw new Error('Unknow operator: ' + rule.operator);
          }
          return new TreeNode('', q);
        }
      }

    });

    return RulesTranslator;
  });
