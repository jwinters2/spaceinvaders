#!/usr/bin/env node

var http = require('http');
var fs   = require('fs');
var scoreboard = require('./scoreboard');

var server = http.createServer(function(request, response)
{
  if(request.url.localeCompare("/getscores") === 0)
  {
    console.log(typeof(response));
    var json = scoreboard.getScoreboard(response);
    /*
      console.log(json);
      response.writeHead(200, {'Content-Type': 'application/json'});
      response.write(json);
      response.end();
    */
  }
  else if(request.method === 'POST')
  {
    /*
     * submitting an entry for the scoreboard is a post request
     */
    var done = false;

    let bodyArr = [];
    let body = "";
    request.on('data', (chunk) =>
    {
      bodyArr.push(chunk);
    }).on('end', () =>
    {
      body = Buffer.concat(bodyArr).toString();
      console.log(body);
      scoreboard.handlePost(response, body);
    });
  }
  else
  {
    var filename = request.url.substring(1);

    if(filename.length === 0)
    {
      filename = 'index.html';
    }
    else if(filename.indexOf('.') === -1) 
    {
      filename.concat('.html');
    }

    var content_type = 'text/html';
    if(filename.endsWith(".js"))
    {
      content_type = 'application/javascript';
    }
    else if(filename.endsWith(".css"))
    {
      content_type = 'text/css';
    }
    else if(filename.endsWith(".gif"))
    {
      content_type = 'image/gif';
    }
    else if(filename.endsWith(".mp3"))
    {
      content_type = 'audio/mpeg';
    }

    fs.readFile(filename, function(error, data)
    {
      if(error)
      {
        response.writeHead(400);
        response.end();
      }
      else
      {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(data);
        response.end();
      }
    });
  }
});

server.listen(80);
