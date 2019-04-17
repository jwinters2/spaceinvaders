var sendScore = function(score)
{
  var name = prompt("What is your name?");  

  if(name === null)
  {
    // don't bother sending anything if the user clicks "Cancel"
    window.location.href = 'scoreboard.html';
    return;
  }

  var request = new XMLHttpRequest();
  request.open("POST", "/");
  request.setRequestHeader("Content-type", "application/json");

  request.onreadystatechange = function()
  {
    if(request.readyState === 4) //XMLHttpRequest.readyState.DONE
    {
      console.log("sendScore response: " + request.status);
    }
    window.location.href = 'scoreboard.html';
  };

  // adjust timestamp for timezone
  var currentTime = new Date();
  var timestamp = (Date.now() - (60000 * currentTime.getTimezoneOffset()));

  data = 
  {
    application: "spaceinvaders",
    data:
    {
      name: name,
      score: score,
      time: timestamp
    }
  };
  console.log(JSON.stringify(data));
  request.send(JSON.stringify(data));
}
