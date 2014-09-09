var NavTree = require('option-tree-navigate')
var FilterTree = require('option-tree-filter')
var SelectAction = require('option-select-action')

var Observ = require('observ')
var ObservArray = require('observ-array')
var ObservStruct = require('observ-struct')
var Computed = require('observ/computed')

module.exports = TreeData

function TreeData (data, opts) {
  data = data || {}

  var options = ObservArray(data.options || [])
  var filter = Observ(data.filter || function () { return true })
  var query = Observ(data.query)
  var value = ObservArray(data.value || [])
  var actions = Observ(data.actions || {})

  var filtered = Computed([
    options, filter, query, value
  ], function (options, fn, query, value) {
    var filter = FilterTree(options, fn, opts)
    return filter.query(query, value)
  })

  return ObservStruct({
    options: options,
    value: value,
    query: query,
    filter: filter,

    filtered: filtered,
    tree: Computed([filtered], function (filtered) {
      return NavTree(filtered)
    }),

    store: Computed([actions, value], function (actions, value) {
      return SelectAction(actions, value, opts)
    }),
    active: Observ(null),
    actions: actions
  })
}
