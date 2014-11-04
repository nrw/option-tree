var test = require('tape')

var OptionTree = require('..')

var tree

test('navigate active option', function (t) {
  tree = OptionTree({
    options: [
      {value: 'a'},
      {value: 'b'},
      {value: 'c'}
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
      {value: 'a'},
      {value: 'b'},
      {value: 'c'}
    ]
  })

  tree.select(tree.active())
  t.same(tree.value(), [{value: 'a'}])
  t.same(tree.active(), [0])

  tree.next()
  tree.select(tree.active())
  t.same(tree.active(), [1])
  t.same(tree.value(), [{value: 'a'}, {value: 'b'}])

  tree.pop()
  t.same(tree.value(), [{value: 'a'}])

  t.end()
})

test('filter and query', function (t) {
  tree = OptionTree({
    options: [
      {value: 'a'},
      {value: 'b'},
      {value: 'c'}
    ],
    filter: function (option, query, value) {
      // omit selected
      for (var i = value.length - 1; i >= 0; i--) {
        if (option.value === value[i].value) return {
          keep: false
        }
      }
      return true
    }
  })

  t.same(tree.filtered(), [{value: 'a'}, {value: 'b'}, {value: 'c'}])
  t.same(tree.value(), [])
  tree.select([0])
  t.same(tree.value(), [{value: 'a'}])
  t.same(tree.filtered(), [{value: 'b'}, {value: 'c'}])
  t.end()
})

test('modify options and value with actions', function (t) {
  tree = OptionTree({
    options: [
      {value: 'create'},
      {value: 'b'},
      {value: 'c'}
    ],
    filter: function (option, query, value) {
      if (option.value === 'create') return {keep: true}

      try {
        if (new RegExp(query, 'i').test(option.value)) {
          return true
        }
      } catch (e) {}

      return false
    },
    actions: {
      create: function (opt, query) {
        var all = tree.options()
        all.push({value: query})
        tree.setOptions(all)
        tree.setQuery('')
      }
    }
  })

  t.same(tree.options(), [{value: 'create'}, {value: 'b'}, {value: 'c'}])
  tree.setQuery('hi')
  t.same(tree.filtered(), [{value: 'create'}])

  tree.select([0])
  t.same(tree.options(), [{value: 'create'}, {value: 'b'}, {value: 'c'}, {value: 'hi'}])
  t.same(tree.filtered(), [{value: 'create'}, {value: 'b'}, {value: 'c'}, {value: 'hi'}])
  tree.setQuery('hi')
  t.same(tree.filtered(), [{value: 'create'}, {value: 'hi'}])
  t.end()
})
