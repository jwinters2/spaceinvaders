var http  = require('http');
var mysql = require('../../server/node_modules/mysql/index.js');
var login_info = require("./db_login.json");

exports.handlePost = function(response, query)
{
  // parse the data from the JSON
  // var query = JSON.parse(body);


  if(query.name == null || query.score == null || query.time == null)
  {
    response.writeHead(400);
    response.end();
    return;
  }

  console.log("name  = " + query.name);
  console.log("score = " + query.score);

  // MySQL doesn't take an integer timestamp, we need to parse it into a
  // more readable format
  var time = new Date(query.time);
  var timestr = '' + time.getFullYear();
  timestr = timestr.concat("-",time.getMonth());
  timestr = timestr.concat("-",time.getDate());
  timestr = timestr.concat(" ",time.getHours());
  timestr = timestr.concat(":",time.getMinutes());
  timestr = timestr.concat(":",time.getSeconds());

  console.log("time  = " + query.time + " (" + timestr + ")");

  var connection = mysql.createConnection(login_info);

  console.log("created connection");

  connection.connect(function(error)
  {
    console.log("connection established");
    if(error)
    {
      console.log("error in connecting");
      throw error;
    }

    var command = "INSERT INTO spaceinvaders VALUES (<name>, <score>, <time>)";
    command = command.replace("<name>", connection.escape(query.name));
    command = command.replace("<score>", connection.escape(query.score));
    command = command.replace("<time>", connection.escape(timestr));

    console.log(command);

    connection.query(command, function(error, result)
    {
      if(error)
      {
        console.log("error in query");
        throw error;
      }
      console.log("affectedRows = " + result.affectedRows);
      console.log("changedRows  = " + result.changedRows);
      console.log("message: \"" + result.message + "\"");
      
      response.writeHead(200);
      response.end();
    });
  });
};

exports.getScoreboard = function(response)
{
  console.log("-------------");
  console.log("getScoreboard");
  console.log("-------------");
  var connection = mysql.createConnection(login_info);

  connection.connect(function(error)
  {
    console.log("connection made");
    if(error)
    {
      console.log("error in connecting");
      throw error;
    }

    var command = "SELECT * FROM spaceinvaders ORDER BY score DESC LIMIT 10";

    connection.query(command, function(error, result)
    {
      if(error)
      {
        console.log("error in query");
        throw error;
      }
      console.log("message: \"" + result.message + "\"");
      retval = JSON.stringify(result);
      console.log(retval);
      response.writeHead(200, {'Content-Type': 'application/json'});
      response.write(retval);
      response.end();
    });
  });
};
