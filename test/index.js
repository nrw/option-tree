var test = require('tape')

var OptionTree = require('..')

var tree

test('navigate active option', function (t) {
  tree = OptionTree({
    options: [
      {id: 'a'},
      {id: 'b'},
      {id: 'c'}
    ]
  })

  t.same(tree.active(), [0])
  tree.next()

  t.same(tree.active(), [1])
  tree.next()
  t.same(tree.active(), [2])
  tree.next()
  t.same(tree.active(), [2])
  tree.prev()
  t.same(tree.active(), [1])
  tree.prev()
  t.same(tree.active(), [0])
  tree.prev()
  t.same(tree.active(), [0])
  t.ok(tree.isActive(tree.active()), 'active')

  t.notOk(tree.isActive('junk'), 'not active')
  t.notOk(tree.isActive([1]), 'not active')
  tree.next()
  t.ok(tree.isActive([1]), 'active')

  t.end()
})

test('selections', function (t) {
  tree = OptionTree({
    options: [
      {id: 'a'},
      {id: 'b'},
      {id: 'c'}
    ]
  })

  tree.select(tree.active())
  t.same(tree.value(), [{id: 'a'}])
  t.same(tree.active(), [0])

  tree.next()
  tree.select(tree.active())
  t.same(tree.active(), [1])
  t.same(tree.value(), [{id: 'a'}, {id: 'b'}])

  tree.pop()
  t.same(tree.value(), [{id: 'a'}])

  t.end()
})

test('filter and query', function (t) {
  tree = OptionTree({
    options: [
      {id: 'a'},
      {id: 'b'},
      {id: 'c'}
    ],
    filter: function (option, query, value) {
      // omit selected
      for (var i = value.length - 1; i >= 0; i--) {
        if (option.id === value[i].id) return {
          keep: false
        }
      }
      return true
    }
  })

  t.same(tree.filtered(), [{id: 'a'}, {id: 'b'}, {id: 'c'}])
  t.same(tree.value(), [])
  tree.select([0])
  t.same(tree.value(), [{id: 'a'}])
  t.same(tree.filtered(), [{id: 'b'}, {id: 'c'}])
  t.end()
})

test('modify options and value with actions', function (t) {
  tree = OptionTree({
    options: [
      {id: 'create'},
      {id: 'b'},
      {id: 'c'}
    ],
    filter: function (option, query, value) {
      if (option.id === 'create') return {keep: true}

      try {
        if (new RegExp(query, 'i').test(option.id)) {
          return true
        }
      } catch (e) {}

      return false
    },
    actions: {
      create: function (opt, query) {
        var all = tree.options()
        all.push({id: query})
        tree.setOptions(all)
        tree.setQuery('')
      }
    }
  })

  t.same(tree.options(), [{id: 'create'}, {id: 'b'}, {id: 'c'}])
  tree.setQuery('hi')
  t.same(tree.filtered(), [{id: 'create'}])

  tree.select([0])
  t.same(tree.options(), [{id: 'create'}, {id: 'b'}, {id: 'c'}, {id: 'hi'}])
  t.same(tree.filtered(), [{id: 'create'}, {id: 'b'}, {id: 'c'}, {id: 'hi'}])
  tree.setQuery('hi')
  t.same(tree.filtered(), [{id: 'create'}, {id: 'hi'}])
  t.end()
})
