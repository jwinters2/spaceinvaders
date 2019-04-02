// -----------------------------------------------------------------------------
// Explosion class
// -----------------------------------------------------------------------------

function Explosion(x,y)
{
  this.type = "explosion";
  this.x = x;
  this.y = y;

  this.width  = 30;
  this.height = 30;

  this.timer = 0;  // it lives for 2/3 of a second or 40 frames

  var images = [];
  images[0] = document.getElementById("explosion_1");
  images[1] = document.getElementById("explosion_2");
  images[2] = document.getElementById("explosion_3");
  images[3] = document.getElementById("explosion_4");
 
  this.logic = function()
  {
    // keep in sync with its still-living bretherin
    this.x += Enemy.xvel

    if(this.timer < 40)
    {
      this.timer++;
    }
    else
    {
      objList.splice(objList.indexOf(this),1);  // delete this
    }
  }

  // keep even more in sync with the living
  this.enemyShift = function()
  {
    this.y += 15;
  }

  this.render = function()
  {
    var index = Math.floor( this.timer / 10);
    if(index > 3)
    {
      index = 3;
    }
    context.drawImage(images[index],this.x-this.width/2,this.y-this.height/2);
  } 
}
