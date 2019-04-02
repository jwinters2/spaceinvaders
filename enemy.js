// -----------------------------------------------------------------------------
// Enemy Class
// -----------------------------------------------------------------------------
function Enemy(x,y)
{
  this.type = "enemy";
  // Enemies need to communicate like a hive mind, so use some static stuff
  // to help

  // this tells all the enemies that they needs to shift
  Enemy.needsToShift = false;

  // tells the enemies when they need to speed up
  Enemy.speedUpTimer = 90;

  // the movement speed in the x axis (in pixels per frame)
  Enemy.xvel = 0.75;

  // the chance of any given enemy firing ( one in {...} )
  Enemy.firechance = 3000;

  // the position of the enemy
  this.x = x;
  this.y = y;

  // the dimensions of the enemy, the origin is the direct center
  this.width  = 30;
  this.height = 30;

  // the sprite of this enemy (randomized for variation)
  var type = Math.floor(Math.random() * 2) + 1;
  var image = document.getElementById("enemy_image_" + type);

  /*
   * logic
   *
   * does all the mathy game-logic-y stuff for a single enemy
   */
  this.logic = function()
  {
    this.x += Enemy.xvel;

    // if an enemy hits the wall and we haven't shifted yet, shift all enemies
    if(this.x - this.width/2 < 0 || this.x + this.width/2 > screen_width)
    {
      Enemy.needsToShift = true;
    }

    // the player loses if an enemy reaches the floor
    if(this.y + this.height/2 >= screen_height)
    {
      gameOver();
    }

    if((Math.random()*Enemy.firechance) < 1) //1 in X chance per enemy per frame
    {
      objList.push(new Bullet(this.x,this.y+this.height,0,3));
      playSound("enemy_shoot");
    }
  }

  // only to be called at the beginning of a wave
  Enemy.updateDifficulty = function(wave)
  {
    Enemy.xvel = 0.75 * (1 + Math.log(wave+1));
    Enemy.firechance = 1000 + (2000 *  Math.exp(-0.2 * wave));
  }
  
  Enemy.speedUp = function()
  {
    if(Enemy.speedUpTimer == 0)
    {
      Enemy.speedUpTimer = 90;

      if(Enemy.xvel > 0)
      {
        // it's positive, add to make it more positive
        Enemy.xvel += 0.05;
      }
      else
      {
        Enemy.xvel -= 0.05;
      }
    }
    else
    {
      Enemy.speedUpTimer--;
    }
  }

  Enemy.shiftAll = function()
  {
    if(Enemy.needsToShift)
    {
      Enemy.xvel = -Enemy.xvel;

      // check all the objects
      for(var i=0; i<objList.length; i++)
      {
        // if the enemyShift function exists, it's an enemy, so do it
        if(typeof(objList[i].enemyShift) == 'function')
        {
          objList[i].enemyShift();
        }
      }
    }

    Enemy.needsToShift = false;
  }

  this.render = function()
  {
    context.drawImage(image,this.x-this.width/2,this.y-this.height/2)
  }

  this.enemyShift = function()
  {
    this.y += 15;
  }
}


