var http = require('http')
var when = require('promised-io/promise').when;
var taskFetcher = require('./lib/task_fetcher');
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

var app = http.createServer( function (req, res) {
  if (/^\/tasks[\/.*]?/.test(req.url)) {
    serveTasks(res)
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

when(taskFetcher.fetch(), function (tasks) {
  taskList = tasks
}, function (err) {
  console.error(err)
})

app.listen(PORT)
console.log('running at localhost:' + PORT + '...')
