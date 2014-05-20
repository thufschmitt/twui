var http = require('http')
var when = require('promised-io/promise').when;
var taskFetcher = require('./lib/task_fetcher');
var taskModifier = require('./lib/task_modifier');
var fs = require('fs')
var path = require('path')
var mime = require('mime')

var PORT = 2718

var taskList

function send404(response) {
  response.writeHead(404, {'Content-Type': 'text/plain'})
  response.write('Error 404: resource not found.')
  response.end()
}

function badRequest(response) {
  response.writeHead(400, {'Content-Type': 'text/plain'})
  response.end()
}

function sendFile(response, filePath, fileContents) {
  response.writeHead(
    200,
    {"content-type": mime.lookup(path.basename(filePath))}
  );
  response.end(fileContents)
}

function serveStatic(response, absPath) {
  fs.exists(absPath, function(exists) {
    if (exists) {
      fs.readFile(absPath, function(err, data) {
        if (err) {
          send404(response)
        } else {
          sendFile(response, absPath, data)
        }
      })
    } else {
      send404(response)
    }
  })
}

function serveTasks(res) {
  res.writeHead(
    200,
    {"content-type": "application/json"}
  );
  res.end(JSON.stringify(taskList))
}

function reloadTasks() {
  when(taskFetcher.fetch(), function (tasks) {
    taskList = tasks
  }, function (err) {
    console.error(err)
  })
}

function handleRefresh(res) {
  reloadTasks()
  res.writeHead(202, {"content-type": "text/plain"})
  res.end()
}

var app = http.createServer( function (req, res) {
  var data
  if (/^\/tasks[\/.*]?/.test(req.url)) {
    serveTasks(res)
  } else if (/^\/done/.test(req.url)) {
    if(req.method === 'PUT') {
      data = ''
      req.on('data', function(chunk) { data += chunk.toString() })
      req.on('end', function() {
        try {
          var id = JSON.parse(data).uuid
          when(taskModifier.done(id),
               function () {
                 res.writeHead(204, {'content-type': 'application/json'})
                 res.end()
               },
               function (err) {
                 switch(err) {
                   case 'internal':
                     res.writeHead(500)
                     break
                   case 'bad uuid':
                     res.writeHead(400)
                     break
                 }
                 res.writeHead({'content-type': 'text/plain'})
                 res.end()
               }
            )
        } catch (e) {
          badRequest(res)
        }
      })
    } else {
      badRequest(res)
    }
  } else if (/^\/delete/.test(req.url)) {
    if(req.method === 'PUT') {
      data = ''
      req.on('data', function(chunk) { data += chunk.toString() })
      req.on('end', function() {
        try {
          var id = JSON.parse(data).uuid
          when(taskModifier.delete(id),
            function() {
              res.writeHead(204, {'content-type': 'application/json'})
              res.end()
            },
            function (err) {
              switch(err) {
                case 'internal':
                  res.writeHead(500)
                  break
                case 'bad uuid':
                  res.writeHead(400)
                  break
              }
              res.writeHead({'content-type': 'text/plain'})
              res.end()
            }
          )
        } catch (e) {
          badRequest(res)
        }
      })
    } else {
      badRequest()
    }
  } else if (/^\/add/.test(req.url)) {
    if(req.method === 'PUT') {
      data = ''
      req.on('data', function(chunk) { data += chunk.toString() })
      req.on('end', function() {
        try {
          var taskdata = JSON.parse(data)
          when(taskModifier.create(taskdata),
            function (value) {
              res.writeHead(201, {'content-type': 'applicaiton/json'})
              res.end(JSON.stringify(value))
            },
            function (err) {
              switch(err) {
                case 'internal':
                  res.writeHead(500)
                  break
                case 'malformed data':
                  res.writeHead(400)
                  break
              }
              res.writeHead({'content-type': 'text/plain'})
              res.end()
            }
          )
        } catch (e) {
          badRequest(res)
        }
      })
    } else {
      badRequest(res)
    }
  } else if ('/refresh' === req.url) {
    handleRefresh(res)
  } else {
    var path
    if (req.url === '/') {
      path = 'public/index.html'
    } else {
      path = 'public' + req.url
    }
    serveStatic(res, './' + path)
  }
})

reloadTasks()
app.listen(PORT)
console.log('running at localhost:' + PORT + '...')
