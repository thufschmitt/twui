var spawn = require('child_process').spawn
var Deferred = require('promised-io/promise').Deferred
var when = require('promised-io/promise').when
var seq = require('promised-io/promise').seq
var Task = require('./task')

exports.fetch = function () {
  return seq([fetchRaw, toTasks])
}

function fetchRaw () {
  var deferred = new Deferred();
  var taskLog = ""
  var taskwarrior = spawn('task', ['export'])

  taskwarrior.stdout.on('data', function (data) {
    taskLog += data.toString()
  })
  taskwarrior.stdout.on('close', function() {
    deferred.resolve(taskLog)
  })
  taskwarrior.on('exit', function(code) {
    console.log('taskwarrior exited with status: ' + code)
  })
  taskwarrior.on('error', function() {
    console.error('child process failed')
  })

  return deferred.promise;
}

function toTasks (raw) {
  var deferred = new Deferred();
  when(raw,
       function(value) {
         try {
           deferred.resolve(
             JSON.parse('[' + value + ']')
                 .map(function(row) { return new Task(row) })
           )
         } catch (e) {
           deferred.reject(e)
         }
       },
       function(err) {
         console.error(err);
         throw err;
       }
  )
  return deferred.promise;
}
