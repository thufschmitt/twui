var http = require('http')

var PORT = 2718

var app = http.createServer( function (req, res) {
  res.writeHead(
    200,
    {"content-type": "text/html"}
  );
  res.end('<p>Hello.</p>')
})

app.listen(PORT)
console.log('running at localhost:' + PORT + '...')
