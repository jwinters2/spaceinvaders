// -----------------------------------------------------------------------------
// Powerup
// -----------------------------------------------------------------------------

function Powerup(x,y)
{
  this.type = "powerup";

  this.x = x;
  this.y = y;
  
  this.width  = 18;
  this.height = 18;

  var image = document.getElementById("powerup");

  this.lifetime = 90;

  this.yvel = 5;
  this.xvel;

  if(Math.floor(Math.random() * 2) == 0)
  {
    this.xvel = 2;
  }
  else
  {
    this.xvel = -2;
  }

  this.logic = function()
  {

    // if we're not on the floor, fall.  Otherwise move left and right
    if(this.y + this.height/2 + 3 < screen_height)
    {
      this.y += this.yvel;
    }
    else
    {
      this.y = screen_height - this.height/2 - 3;
      this.x += this.xvel; 

      // tick tock to death, just like the rest of us
      this.lifetime--;
      if(this.lifetime == 0)
      {
        objList.splice(objList.indexOf(this),1);
      }
    }

    // change directions if we hit a wall
    if(this.x - this.width/2 < 0 || this.x + this.width/2 > screen_width)
    {
      this.x -= this.xvel;
      this.xvel *= -1;
    }

    // apply powerup when we collide with the player
    for(var i=0; i<objList.length; i++)
    {
      // going up means the player shot me, shoot enemies
      if(objList[i].type === "player" && collide(this,objList[i]))
      {
        // delete this
        objList.splice(objList.indexOf(this),1);
        objList[i].powerup();
        playSound("powerup_sound");
      }
    }
  }

  this.render = function()
  {
    context.drawImage(image,this.x-this.width/2,this.y-this.height/2);
  }
}


