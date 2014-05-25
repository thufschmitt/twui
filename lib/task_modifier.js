var spawn = require('child_process').spawn
var Deferred = require('promised-io/promise').Deferred

exports.done = function (uuid) {
  return completeTask(uuid)
}

exports.create = function (taskdata) {
  return createTask(taskdata)
}

exports.delete = function (uuid) {
  return deleteTask(uuid)
}

exports.modify = function (taskdata) {
  return modifyTask(taskdata)
}

exports.annotate = function (uuid, annotation) {
  return annotateTask(uuid, annotation)
}

exports.undo = function () {
  return undo()
}

function completeTask(uuid) {
  var deferred = new Deferred();
  var taskwarrior = spawn('task', ['uuid:' + uuid, 'done'])
  taskwarrior.on('exit', function(code) {
    if(code === 0) {
      deferred.resolve('done')
    } else {
      deferred.reject('bad uuid')
    }
  })
  taskwarrior.on('error', function() {
    console.error('child process failed')
    deferred.reject('internal')
  })

  return deferred.promise;
}

function deleteTask(uuid) {
  var deferred = new Deferred();
  var taskwarrior = spawn('task', ['uuid:' + uuid, 'delete'])
  taskwarrior.on('exit', function(code) {
    if(code === 0) {
      deferred.resolve('done')
    } else {
      deferred.reject('bad uuid')
    }
  })
  taskwarrior.on('error', function() {
    console.error('child process failed')
    deferred.reject('internal')
  })

  taskwarrior.stdin.write("yes\n")

  return deferred.promise;
}

function newTaskArgs(data) {
  args = []
  args.push(data.description)
  if(data.project) args.push('proj:"' + data.project + '"')
  if(data.due) args.push('due:"' + data.due + '"')
  if(data.priority) {
    args.push('pri:"' + data.priority + '"')
  } else {
    args.push('pri: ')
  }
  return args
}

function createTask(data) {
  var deferred = new Deferred();
  var args = ['add']
  var taskwarrior = spawn('task', (['add']).concat(newTaskArgs(data)))
    taskwarrior.on('exit', function(code) {
      if(code === 0) {
        deferred.resolve('done')
      } else {
        deferred.reject('malformed data')
      }
    })
  taskwarrior.on('error', function() {
    console.error('child process failed')
    deferred.reject('internal')
  })

  return deferred.promise;
}

function modifyTask(data) {
  var deferred = new Deferred();
  var args = ['uuid:' + data.uuid, 'modify']
  args = args.concat(newTaskArgs(data))
  var taskwarrior = spawn('task', args)
  taskwarrior.on('exit', function(code) {
    if(code === 0) {
      deferred.resolve('done')
    } else {
      deferred.reject('malformed data')
    }
  })
  taskwarrior.on('error', function() {
    console.error('child process failed')
    deferred.reject('internal')
  })
  taskwarrior.stdout.on('data', function(data) {
    if (data.toString().indexOf('yes/no') > -1) { taskwarrior.stdin.write("yes\n") }
  })

  return deferred.promise;
}

function undo() {
  var deferred = new Deferred();
  var taskwarrior = spawn('task', ['undo'])
  taskwarrior.on('exit', function(code) {
    if(code === 0) {
      deferred.resolve('done')
    } else {
      deferred.reject('malformed data')
    }
  })
  taskwarrior.on('error', function() {
    console.error('child process failed')
    deferred.reject('internal')
  })
  taskwarrior.stdout.on('data', function(data) {
    if (data.toString().indexOf('yes/no') > -1) { taskwarrior.stdin.write("yes\n") }
  })

  return deferred.promise;
}

function annotateTask(uuid, annotation) {
  var deferred = new Deferred();
  var args = ['uuid:' + uuid, 'annotate', annotation]
  var taskwarrior = spawn('task', args)
  taskwarrior.on('exit', function(code) {
    if(code === 0) {
      deferred.resolve('done')
    } else {
      deferred.reject('malformed data')
    }
  })
  taskwarrior.on('error', function() {
    console.error('child process failed')
    deferred.reject('internal')
  })
  taskwarrior.stdout.on('data', function(data) {
    if (data.toString().indexOf('yes/no') > -1) { taskwarrior.stdin.write("yes\n") }
  })

  return deferred.promise;
}
