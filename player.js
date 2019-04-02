// ----------------------------------------------------------------------------
// Player Class
// ----------------------------------------------------------------------------

function Player(x,y)
{
  this.type = "player";

  // the position of the player
  this.x = x;
  this.y = y;

  // the dimensions of the player, the origin is the middle of the bottom
  this.width  = 30;
  this.height = 20;

  // the movement speed (in pixels per frame)
  this.speed = 5;

  // the sprite of this object
  // for some reason this needs to be in the .html file
  var image = document.getElementById("player_image");

  // these are to make a delay between shots, 
  // and make sure we can't hold space to shoot a stream
  var shootCooldown = 0;
  var canShoot = true;

  var powerupSpread = 0;
  var powerupFire   = 0;


  /*
   * logic
   *
   * do whatever a player does every frame
   *
   *   - move according to keyboard
   *   - if out of frame move back
   *   - shoot if spacebar is pressed
   */
  this.logic = function()
  {
    // lower the cooldown if we need to
    // it only starts when we let go of the spacebar
    if(shootCooldown > 0)
    {
      shootCooldown--; 
    }

    // handle powerups
    if(powerupSpread > 0)
    {
      powerupSpread--;
    }
    if(powerupFire > 0)
    {
      powerupFire--;
    }

    // if the player pressed right and there's room, move right
    if(keyboardState.right && this.x + this.width/2 < screen_width)
    {
      this.x += this.speed;
    }

    // if the player pressed left and there's room, move left
    if(keyboardState.left && this.x - this.width/2 > 0 )
    {
      this.x -= this.speed;
    }

    // shoot
    if(keyboardState.spacebar)
    {
      if(shootCooldown == 0 && (canShoot || powerupFire > 0))
      {
        if(powerupFire > 0)
        {
          shootCooldown = 10;
        }
        else
        {
          shootCooldown = 20;
        }

        playSound("player_shoot");
        objList.push(new Bullet(this.x,this.y-this.height,0,-5));

        if(powerupSpread > 0)
        {
          objList.push(new Bullet(this.x,this.y-this.height, 1,-5));
          objList.push(new Bullet(this.x,this.y-this.height,-1,-5));
        }
      }
      canShoot = false;
    }
    else
    {
      // we let go of the space bar, we can shoot again
      canShoot = true;
    }
  }

  /*
   * render
   *
   * draw itself to the screen
   */
  this.render = function()
  {
    if(isGameOver)
    {
      var dead_image = document.getElementById("player_dead_image");
      context.drawImage(dead_image,this.x-this.width/2,this.y-this.height*1.5)
    }
    else
    {
      context.drawImage(image,this.x-this.width/2,this.y-this.height*1.5)
    }
  }

  this.powerup = function()
  {
    var result = Math.floor(Math.random() * 3);
    var filename;

    switch(result)
    {
      case 0:
        // do the spread shoot powerup
        powerupSpread = 270;
        filename = "spread_bonus";
        break;

      case 1:
        // do the firerate powerup
        powerupFire = 270;
        filename = "speed_bonus";
        break;

      case 2:
        score += 1000;
        filename = "score_bonus";
        break;
    }

    objList.push(new PowerupIcon(this.x,this.y - 30,filename));
  }
}
