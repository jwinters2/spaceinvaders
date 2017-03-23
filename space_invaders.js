"use strict";

// the dimensions of the canvas
const screen_width  = 800;
const screen_height = 510;

// the framerate (the delay between frames in milliseconds )
// the game runs at 60FPS, so between frames there's 1/60 of 1000ms
const framerate = 1000/60;

// the html canvas (the thing we're drawing to)
// and the other things we need to connect to the board
var canvas;
var context;
var interval;

// an array of objects in which to store everything
var objList = [];

// keep track of whether or not the game has ended, and whether or not we won
var isGameOver = false;
var isVictory = false;

// keeps track of which keys are being pressed right now
var keyboardState = {left:false, right:false, space:false, p:false};

// the player's score
var score = 0;

// whether or not we're paused
var isPaused = false;

// whether or not the player turned off the sound
var isMuted = false;

// images
var gameOverImage = document.getElementById("game_over_image");
var winImage      = document.getElementById("win_image");
var pauseImage    = document.getElementById("pause_image");

// ----------------------------------------------------------------------------
//                              Main Functions
// ----------------------------------------------------------------------------


// ---------------------------- Setup Functions -------------------------------

/*
 * startGame
 *
 * initializes the objects in the game and starts the main game loop
 */
function startGame()
{
  // make player and add to array
  var player = new Player(screen_width/2,screen_height);
  objList.push(player);

  // make enemies
  for(var y = 30; y <= 30 * 6; y += 30)
  {
    for(var x = 30; x <= 30 * 16; x += 30)
    {
      objList.push(new Enemy(x,y));
    }
  }

  // make shields
  for(var x = 127; x <= screen_width/2; x += 180)
  {
    makeShieldPattern(x,350);
    makeShieldPattern(screen_width-x,350);
  }

  // setup the listeners so we can know when the player presses something
  setupKeyboardListener();

  // connect to canvas in html file
  connectToCanvas(); 

  // set the interval (call step every interval milliseconds)
  interval = setInterval(step,framerate);
}

/*
 * connectToCanvas
 *
 * sets up the html canvas so that what happens here shows up
 * in the html canvas and is visible to the player
 */
function connectToCanvas()
{
  canvas = document.getElementById("canvas"); // store the canvas

  canvas.width  = screen_width;               // set the dimensions
  canvas.height = screen_height;

  context = canvas.getContext("2d");          // store the context
                                              // (we need this to talk to it)
}

// ---------------------------- Game Functions -------------------------------

/*
 * step
 *
 * this is the main loop function that runs once every frame
 * basically it does the logic part, than the rendering part, and repeat
 */
function step()
{
  logic();
  render();
}

/*
 * logic
 *
 * this does all the math and gamelogic in the game
 *
 * basically it goes through the object list and tells everything to do its
 * thing
 */
function logic()
{
  if(isPaused)
  {
    return;
  }

  // do each object's logic
  if(!isGameOver)
  {
    for(var i=0; i<objList.length; i++)
    {
      objList[i].logic();
    }
  
    // speed up all the enemies in sync
    Enemy.speedUp();

    // shift all the enemies in a hive-mind like fashion
    Enemy.shiftAll();
  }
}

/*
 * render
 *
 * this handles the graphics and prints all the objects to the screen
 */
function render()
{
  // remove what was in the canvas before
  context.clearRect(0,0,screen_width,screen_height);

  // render each object
  for(var i=0; i<objList.length; i++)
  {
    objList[i].render();
  }

  // if the game's over, show a game over sign
  if(isGameOver)
  {
    context.drawImage(gameOverImage,
                      screen_width/2  - gameOverImage.width/2,
                      screen_height/2 - gameOverImage.height/2);
      
  }
  // print you win text if there are no enemies left
  else if(objectCount("enemy") == 0)
  {
    context.drawImage(winImage,
                      screen_width/2  - winImage.width/2,
                      screen_height/2 - winImage.height/2);

    // play the victory sound if we haven't already done so
    if(!isVictory)
    {
      playSound("win");
      isVictory = true;
    }
  }
  // print pause label (we can't pause if the game is over)
  else if(isPaused)
  {
    context.drawImage(pauseImage,
                      screen_width/2  - pauseImage.width/2,
                      screen_height/2 - pauseImage.height/2);
  }

  // print the score
  context.font = "16px Lucida Sans Console";    // set the font
  context.fillStyle = "#00FF00";                // set the font color
  context.textAlign = "right";                  // set align to right
  context.fillText(padNumber(score,4),screen_width-3,16);
}

// ----------------------------- I/O Functions --------------------------------

/*
 * setupKeyboardListener
 *
 * makes the webpage pay attention to the keyboard and respond to keypresses
 */
function setupKeyboardListener()
{
  // when the user presses a key, make that key's variable true
  document.addEventListener('keydown',function(event)
  {
    switch(event.keyCode)
    {
      case 37:  // left arrow
      case 65:  // a
        keyboardState.left = true;  
        break;

      case 39:  // right arrow
      case 68:  // d
        keyboardState.right = true;  
        break;

      case 32:  // space bar
        keyboardState.spacebar = true;
        break;

      case 80:  // p
        keyboardState.p = true;
        isPaused = !isPaused;
        break;

      case 82:  // r
        location.reload(); 
        break;
      
      case 81:  // q
        window.history.back(); 
        break;

      case 77:  // m
        isMuted = !isMuted;
        break;
    }
  });

  // when the user releases a key, make that key's variable false
  document.addEventListener('keyup',function(event)
  {
    switch(event.keyCode)
    {
      case 37:  // left arrow
      case 65:  // a
        keyboardState.left = false;  
        break;

      case 39:  // right arrow
      case 68:  // d
        keyboardState.right = false;  
        break;

      case 32:  // space bar
        keyboardState.spacebar = false;
        break;

      case 80:
        keyboardState.p = false;
        break;
    }
  });
}

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

    if((Math.random()*3000) < 1) // 1 in X chance per enemy per frame
    {
      objList.push(new Bullet(this.x,this.y+this.height,0,3));
      playSound("enemy_shoot");
    }
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

// -----------------------------------------------------------------------------
// Shield Class
// -----------------------------------------------------------------------------

function Shield(x,y)
{
  this.type = "shield";

  this.x = x;
  this.y = y;

  this.width  = 15;
  this.height = 15;

  this.health = 3;

  var images = [];
  images[0] = document.getElementById("shield_image_1");
  images[1] = document.getElementById("shield_image_2");
  images[2] = document.getElementById("shield_image_3");

  this.logic = function()
  {
  }

  this.render = function()
  {
    if(this.health > 0)
    {
      context.drawImage(images[3 - this.health],
                        this.x-this.width/2,this.y-this.height/2)
    }
  }

  this.getHit = function()
  {
    this.health--;

    if(this.health == 0)
    {
      objList.splice(objList.indexOf(this),1);  // delete this
    }
  }
}

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

// -----------------------------------------------------------------------------
// Score Bonus
// -----------------------------------------------------------------------------

function PowerupIcon(x,y,filename)
{
  this.type = "powerup_icon";

  this.x = x;
  this.y = y;

  this.width = 87;
  this.height = 30;

  this.yvel = -1;

  this.lifetime = 45;

  var image = document.getElementById(filename);

  this.logic = function()
  {
    this.y += this.yvel;

    this.lifetime--;

    if(this.lifetime == 0)
    {
      objList.splice(objList.indexOf(this),1);
    }
  }

  this.render = function()
  {
    context.drawImage(image,this.x-this.width/2,this.y-this.height/2);
  }
}

// -----------------------------------------------------------------------------
// Etc. Utils
// -----------------------------------------------------------------------------

function gameOver()
{
  isGameOver = true;
  playSound("game_over");
}

function collide(a,b)
{
  if(a.x + a.width/2 < b.x - b.width/2)
  {
    return false;
  }
  if(a.x - a.width/2 > b.x + b.width/2)
  {
    return false;
  }

  if(a.y + a.height/2 < b.y - b.height/2)
  {
    return false;
  }
  if(a.y - b.height/2 > b.y + b.height/2)
  {
    return false;
  }

  return true;
}

function padNumber(num,len)
{
  var retval = "" + num;
  while(retval.length < len)
  {
    retval = "0" + retval;
  }
  return retval;
}

function objectCount(type)
{
  var retval = 0;

  for(var i = 0; i < objList.length; i++)
  {
    if(objList[i].type === type)
    {
      retval++;
    }
  }

  return retval;
}

function makeShieldPattern(x,y)
{
  objList.push(new Shield(x + 15*(-3), y + 15*(6) ));
  objList.push(new Shield(x + 15*(-3), y + 15*(5) ));
  objList.push(new Shield(x + 15*(-3), y + 15*(4) ));

  for(var i=1; i<5; i++)
  {
    objList.push(new Shield(x + 15*(i-3), y + 15*(5) ));
    objList.push(new Shield(x + 15*(i-3), y + 15*(4) ));
    objList.push(new Shield(x + 15*(i-3), y + 15*(3) ));
  }

  objList.push(new Shield(x + 15*(2), y + 15*(6) ));
  objList.push(new Shield(x + 15*(2), y + 15*(5) ));
  objList.push(new Shield(x + 15*(2), y + 15*(4) ));
}

function playSound(id)
{
  if(!isMuted)
  {
    var sound = document.getElementById(id);
    sound.play();
  }
}
