var NavTree = require('option-tree-navigate')
var FilterTree = require('option-tree-filter')
var SelectAction = require('option-select-action')

var Observ = require('observ')
var ObservArray = require('observ-array')
var ObservStruct = require('observ-struct')
var Computed = require('observ/computed')

var arrayEqual = require('array-equal')

module.exports = OptionTree

function OptionTree (initial, opts) {
  initial = initial || {}
  opts = opts || {}

  opts.keyField = opts.keyField || 'value'
  opts.keepMatchChildren = opts.keepMatchChildren !== undefined
    ? opts.keepMatchChildren : true

  var options = ObservArray(initial.options || [])
  var filter = Observ(initial.filter || function () { return true })
  var query = Observ(initial.query || '')
  var value = ObservArray(initial.value || [])
  var actions = Observ(initial.actions || {})
  var active = Observ(null)

  var filtered = Computed([
    options, filter, query, value
  ], function (options, fn, query, value) {
    var filter = FilterTree(options, fn, opts)
    return filter.query(query, value)
  })

  var tree = Computed([filtered], function (filtered) {
    return NavTree(filtered)
  })

  var store = Computed([actions, value], function (actions, value) {
    return SelectAction(actions, value, opts)
  })

  // select first item
  navigate('nextWith')

  // snap on changes
  filtered(snap)
  value(snap)
  options(snap)

  function snap () { navigate('nearestWith') }

  return ObservStruct({
    channels: {
      // navigation
      next: navigate.bind(null, 'nextWith'),
      prev: navigate.bind(null, 'prevWith'),
      // selection
      select: select,
      pop: pop
    },
    // queries
    isActive: isActive,

    options: options,
    value: value,
    query: query,
    filter: filter,
    active: active,
    actions: actions,
    filtered: filtered
  })

  function navigate (method) {
    var t = tree()
    active.set(t[method]('value', active()) || active())
  }

  function select (path) {
    var t = tree()
    var node = t.read(path)

    if (!node) return

    var s = store()

    s.select(node, query())
    value.set(s.value())
    t.nearestWith('value', active())
  }

  function pop () {
    var s = store()
    var node = s.pop()

    value.set(s.value())
    return node
  }

  function isActive (path) {
    if (!Array.isArray(active())) {
      return false
    }

    path = path || []
    return arrayEqual(path, active())
  }
}
