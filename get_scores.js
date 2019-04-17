function getScores()
{
  var request = new XMLHttpRequest();
  var url = "http://" + self.location.hostname + ":" 
          + self.location.port + "/getscores";
  console.log(url);
  request.open("GET", url);
  request.setRequestHeader("Content-type", "application/json");

  request.onreadystatechange = function()
  {
    if(request.readyState === 4 //XMLHttpRequest.readyState.DONE
    && request.status === 200)
    {
      console.log(request.response);

      var table = document.getElementById('scores');
      var json = JSON.parse(request.response);

      for(var i = 0; i<10; i++)
      {
        var row = table.insertRow(table.rows.length);

        let name  = row.insertCell(0);
        let score = row.insertCell(1);
        let time  = row.insertCell(2);

	if(i < json.length)
        {
          name.innerHTML  = json[i].name;
          score.innerHTML = json[i].score;
          time.innerHTML  = json[i].time.replace('T',' ').replace('.000Z','');
        }
        else
        {
          name.innerHTML  = "---";
          score.innerHTML = 0;
          time.innerHTML  = "---------- --:--:--";

          name.style.color  = "#008000";
          score.style.color = "#008000";
          time.style.color  = "#008000";
        }

	name.className  = 'sb';
	score.className = 'sb';
	time.className  = 'sb';

	name.style.width = "60%";
	score.style.width = "10%";
	time.style.width = "30%";

	score.style.textAlign = 'right';

	time.style.fontSize = '16px';
	time.style.textAlign = 'right';
      } 
    }
  };

  request.send();
}
