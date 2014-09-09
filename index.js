var TreeData = require('./data')

module.exports = OptionTree

function OptionTree (data, opts) {
  var tree, store, filter, state

  opts = opts || {}
  opts.keyField = opts.keyField || 'id'
  opts.keepMatchChildren = opts.keepMatchChildren !== undefined ?
    opts.keepMatchChildren : true

  data = TreeData(data, opts)

  // select first item
  navigate(data, 'nextWith')

  data.filtered(snap)
  data.value(snap)
  data.options(snap)

  function snap () { navigate(data, 'nearestWith') }

  return {
    // exports
    state: data,
    // navigation
    next: navigate.bind(null, data, 'nextWith'),
    prev: navigate.bind(null, data, 'prevWith'),
    // selection
    select: select.bind(null, data),
    pop: pop.bind(null, data),

    // queries
    isActive: isActive.bind(null, data),

    // accessors
    options:  function () { return data.options() },
    filtered: function () { return data.filtered() },
    active:   function () { return data.active() },
    value:    function () { return data.value() },
    filter:   function () { return data.filter() },
    actions:  function () { return data.actions() },

    // mutators
    setActions: set.bind(null, data, 'actions'),
    setValue:   set.bind(null, data, 'value'),
    setOptions: set.bind(null, data, 'options'),
    setQuery:   set.bind(null, data, 'query'),
    setFilter:  set.bind(null, data, 'filter')
  }
}

function set (data, field, arg) {
  data[field].set(arg)
}

function navigate (data, method) {
  var tree = data.tree()
  data.active.set(tree[method]('id', data.active()) || data.active())
}

function isActive (data, path) {
  return arrayEqual(path, data.active())
}

function pop (data) {
  var store = data.store()
  var node = store.pop()

  data.value.set(store.value())
  return node
}

function select (data, path) {
  var tree = data.tree()
  var node = tree.read(path)

  if (!node) return

  var store = data.store()

  store.select(node, data.query())
  data.value.set(store.value())
  tree.nearestWith('id', data.active())
}

// helpers
function arrayEqual (a, b) {
  if (a.length !== b.length) return false

  for (var i = a.length - 1; i >= 0; i--) {
    if (a[i] !== b[i]) return false
  }

  return true
}
