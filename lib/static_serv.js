var mime = require('mime')
var fs = require('fs')
var path = require('path')
var statuses = require('httpstatuses')

module.exports = serveStatic

function sendFile(response, filePath, fileContents) {
  response.writeHead(
    statuses.ok,
    {"content-type": mime.lookup(path.basename(filePath))}
  );
  response.end(fileContents)
}

function serveStatic() {
  var req = this.req
  var res = this.res
  var absPath
  if (this.req.url === '/') {
    absPath = 'public/index.html'
  } else {
    absPath = 'public' + this.req.url
  }
  absPath = './' + absPath

  fs.exists(absPath, function(exists) {
    if (exists) {
      fs.readFile(absPath, function(err, data) {
        if (err) {
          res.writeHead(statuses.notFound, {'Content-Type': 'text/plain'})
          res.write('Error 404: resource not found.')
          res.end()
        } else {
          sendFile(res, absPath, data)
        }
      })
    } else {
      res.writeHead(statuses.notFound, {'Content-Type': 'text/plain'})
      res.write('Error 404: resource not found.')
      res.end()
    }
  })
}
