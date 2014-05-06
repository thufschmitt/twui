var spawn = require('child_process').spawn
var Deferred = require('promised-io/promise').Deferred
var when = require('promised-io/promise').when

exports.fetch = function () {
  return fetchRaw()
}

function fetchRaw () {
  var deferred = new Deferred();
  var taskLog = ""
  var taskwarrior = spawn('task', ['export'])

  taskwarrior.stdout.on('data', function (data) {
    taskLog += data.toString()
  })
  taskwarrior.on('close', function() {
    deferred.resolve(taskLog)
  })
  taskwarrior.on('exit', function() {
    console.error('taskwarrior exited')
  })
  taskwarrior.on('error', function() {
    console.error('child process failed')
  })

  return deferred.promise;
}
