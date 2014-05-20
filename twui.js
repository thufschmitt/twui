var http = require('http')
var when = require('promised-io/promise').when;
var taskFetcher = require('./lib/task_fetcher');
var taskModifier = require('./lib/task_modifier');
var fs = require('fs')
var path = require('path')
var mime = require('mime')
var statuses = require('httpstatuses')
var director = require('director')
var serveStatic = require('./lib/static_serv')

var PORT = 2718

var taskList
var projectList

var router = new director.http.Router({
  '/tasks': {
    get: serveTasks,
    post: createTask,
    put: handleRefresh,
    '/([A-Za-z0-9]{8}\-[A-Za-z0-9]{4}\-[[A-Za-z0-9]{4}\-[[A-Za-z0-9]{4}\-[A-Za-z0-9]{12})/': {
      get: serveTask,
      delete: deleteTask,
      post: completeTask,
      put: modifyTask,
      '/annotate': {
        post: annotateTask
      }
    },
  },
  '/.*': {
    get: serveStatic
  }
})

function badRequest(response) {
  response.writeHead(statuses.badRequest, {'Content-Type': 'text/plain'})
  response.end()
}

function serveTask(uuid) {
  var t = undefined
  for(var i = 0; i < taskList.length; i++) {
    if(taskList[i].uuid !== uuid) continue;
    t = taskList[i]
    break
  }
  if(t) {
    this.res.writeHead(
      statuses.ok,
      {"content-type": "application/json"}
    )
    this.res.end(JSON.stringify(t))
  } else {
    badRequest(this.res)
  }
}

function serveTasks() {
  this.res.writeHead(
    statuses.ok,
    {"content-type": "application/json"}
  );
  this.res.end(JSON.stringify(taskList))
}

function inferProjectList(tasks) {
  return tasks.map( function(t) { return t.project } )
       .reduce( function(acc, p) {
         if ( p && acc.indexOf(p) < 0 ) acc.push(p);
         return acc;
       }, [])
}

function reloadTasks() {
  when(taskFetcher.fetch(), function (tasks) {
    taskList = tasks
    projectList = inferProjectList(tasks)
  }, function (err) {
    console.error(err)
  })
}

function createTask() {
  var res = this.res
  when(taskModifier.create(this.req.body),
    function (value) {
      res.writeHead(statuses.created, {'content-type': 'applicaiton/json'})
      res.end(JSON.stringify(value))
    },
    function (err) {
      switch(err) {
        case 'internal':
          this.res.writeHead(statuses.internalServerError)
          break
        case 'malformed data':
          this.res.writeHead(statuses.badRequest)
          break
      }
      res.writeHead({'content-type': 'text/plain'})
      res.end()
    }
  )
}

function deleteTask(uuid) {
  var res = this.res
  when(taskModifier.delete(uuid),
    function() {
      res.writeHead(statuses.noContent, {'content-type': 'application/json'})
      res.end()
    },
    function (err) {
      switch(err) {
        case 'internal':
          res.writeHead(statuses.internalServerError)
          break
        case 'bad uuid':
          res.writeHead(statuses.badRequest)
          break
      }
      res.writeHead({'content-type': 'text/plain'})
      res.end()
    }
  )
}

function completeTask(uuid) {
  var res = this.res
  when(taskModifier.done(uuid),
    function () {
      res.writeHead(statuses.noContent, {'content-type': 'application/json'})
      res.end()
    },
    function (err) {
      switch(err) {
        case 'internal':
          res.writeHead(statuses.internalServerError)
          break
        case 'bad uuid':
          res.writeHead(statuses.badRequest)
          break
      }
      res.writeHead({'content-type': 'text/plain'})
      res.end()
    }
  )
}

function annotateTask(uuid) {
  var res = this.res
  when(taskModifier.annotate(uuid, this.req.body.annotation),
    function() {
      res.writeHead(statuses.noContent, {'content-type': 'application/json'})
      res.end()
    },
    function (err) {
      switch(err) {
        case 'malformed data':
          res.writeHead(statuses.badRequest)
          break
      }
      res.writeHead({'content-type': 'text/plain'})
      res.end()
    }
  )
}

function modifyTask(uuid) {
  var res = this.res
  var data = this.req.body
  data.uuid = uuid
  when(taskModifier.modify(data),
    function() {
      res.writeHead(statuses.noContent, {'content-type': 'application/json'})
      res.end()
    },
    function (err) {
      switch(err) {
        case 'malformed data':
          res.writeHead(statuses.badRequest)
          break
      }
      res.writeHead({'content-type': 'text/plain'})
      res.end()
    }
  )
}

function handleRefresh(res) {
  reloadTasks()
  this.res.writeHead(statuses.accepted, {"content-type": "text/plain"})
  this.res.end()
}

var app = http.createServer( function (req, res) {
  req.chunks = [];
  req.on('data', function(chunk) {
    req.chunks.push(chunk.toString());
  })

  router.dispatch(req, res, function(err) {
    if(err) {
      res.writeHead(statuses.notFound, {'Content-Type': 'text/plain'})
      res.write('Error 404: resource not found.')
      res.end()
    }
  })
})

reloadTasks()
app.listen(PORT)
console.log('running at localhost:' + PORT + '...')
