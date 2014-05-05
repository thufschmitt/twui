var http = require('http')

var PORT = 2718

var app = http.createServer( function (req, res) {
  res.writeHead(
    200,
    {"content-type": "text/html"}
  );
  res.end('<p>Hello.</p>')
})

var spawn = require('child_process').spawn
var taskwarrior = spawn('task', ['export'])

var tasks = ""
taskwarrior.on('data', function (data) {
  tasks += data.toString()
})

taskwarrior.on('close', function () {
  console.log(tasks)
})

app.listen(PORT)
console.log('running at localhost:' + PORT + '...')
