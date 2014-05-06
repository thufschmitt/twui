var properties = [
  'status',
  'uuid',
  'entry',
  'description',
  'start',
  'end',
  'due',
  'until',
  'wait',
  'modified',
  'recur',
  'mask',
  'imask',
  'parent',
  'annotations',
  'tags',
  'priority',
  'depends',
  'project'
]

var defined = properties.reduce(function (acc, prop) {
  acc['prop'] = {value: ''}
  return acc
}, {})

module.exports = function (rowData) {
  Object.defineProperties(this, defined)

  if(rowData) {
    properties.forEach(function (prop) {
      this[prop] = rowData[prop]
    }, this)
  }
}
