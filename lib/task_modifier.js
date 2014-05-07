var spawn = require('child_process').spawn
var Deferred = require('promised-io/promise').Deferred

exports.done = function (uuid) {
  return completeTask(uuid)
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
