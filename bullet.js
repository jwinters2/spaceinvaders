// ----------------------------------------------------------------------------
// Bullet Class
// ----------------------------------------------------------------------------

function Bullet(x,y,xvel,yvel)
{
  this.type = "bullet";

  // the position of the bullet
  this.x = x;
  this.y = y;

  // the dimensions (the origin is in the direct center
  this.width  = 4;
  this.height = 15;

  // the velocity of the bullet
  this.xvel = xvel;
  this.yvel = yvel;

  // the sprite of this object
  var image = document.getElementById("bullet_image");

  /*
   * logic
   *
   * does all the math and logic of a single bullet per frame
   */
  this.logic = function()
  {
    // move
    this.x += this.xvel;
    this.y += this.yvel;

    // if outside the screen, delete itself
    if(this.y < 0 || this.y > screen_height)
    {
      objList.splice(objList.indexOf(this),1);
    }

    // if we collide with the enemy, delete itself and that enemy
    for(var i=0; i<objList.length; i++)
    {
      // going up means the player shot me, shoot enemies
      if(yvel < 0 && objList[i].type === "enemy")
      {
        if(collide(this,objList[i]))
        {
          objList.splice(objList.indexOf(this),1);  // delete this

          // replace enemy with explosion
          objList.push(new Explosion(objList[i].x,objList[i].y));

          if((Math.random()*40) < 1) // 1 in X chance for powerup
          {
            objList.push(new Powerup(objList[i].x,objList[i].y));
          }

          objList.splice(i,1);  // delete this
          score += 100;                             // points!
          playSound("enemy_explode");

          return;
        }
      }

      // going down means an enemy shot me, shoot the player
      if(yvel > 0 && objList[i].type === "player")
      {
        if(collide(this,objList[i]))
        {
          objList.splice(objList.indexOf(this),1);  // delete this
          gameOver();
          return;
        }
      }

      if(objList[i].type === "shield")
      {
        if(collide(this,objList[i]))
        {
          objList.splice(objList.indexOf(this),1);  // delete this
          objList[i].getHit();
          return;
        }
      }
    }
  }

  /*
   * render
   *
   * draw itself to the screen
   */
  this.render = function()
  {
    context.drawImage(image,this.x-this.width/2,this.y-this.height/2)
  }
}


