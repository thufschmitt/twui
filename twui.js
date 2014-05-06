var http = require('http')
var when = require('promised-io/promise').when;
var taskFetcher = require('./lib/task_fetcher');

var PORT = 2718

var taskList

var app = http.createServer( function (req, res) {
  res.writeHead(
    200,
    {"content-type": "application/json"}
  );
  res.end(JSON.stringify(taskList))
})

when(taskFetcher.fetch(), function (tasks) {
  taskList = tasks
}, function (err) {
  console.error(err)
})

app.listen(PORT)
console.log('running at localhost:' + PORT + '...')
