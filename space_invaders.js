/*
 * this should definitely be more t
 */
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

// the number of waves the player has defeates
var wave = 0;

// whether or not we're paused
var isPaused = false;

// whether or not the player turned off the sound
var isMuted = false;

var gameOverPromptTimer = -1;

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

  // sets up the shields and enemies
  cleanupGame();

  // setup the listeners so we can know when the player presses something
  setupKeyboardListener();

  // connect to canvas in html file
  connectToCanvas(); 

  // set the interval (call step every interval milliseconds)
  interval = setInterval(step,framerate);
}

/*
 * cleanupGame
 *
 * resets the enemies and shields
 */
function cleanupGame()
{
  objList.length = 1; // clears array except for the first item (the player)
                      // (i.e., removes the shields and enemies)
                      // it's pretty f*cking stupid that JS lets you do this
                      // the length of an array should be read-only IMO
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

    if(gameOverPromptTimer >= 0)
    {
      gameOverPromptTimer --;
    }

    if(gameOverPromptTimer === 0)
    {
      sendScore(score);
      console.log("get scores");
    }
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
      //isVictory = true;

      // UPDATE: the game originally ended here, but I wanted to add
      // a scoreboard feature to show off the fact that I can use AWS
      // so instead, a new, slightly faster wave of enemies appears
      cleanupGame();
      wave ++;
      Enemy.updateDifficulty(wave);
      score += 1000;

      var p = objList[0]; // player
      objList.push(new PowerupIcon(p.x,p.y - 30,"score_bonus"));
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
  context.font = "24px Share Tech Mono";    // set the font
  context.fillStyle = "#00FF00";                // set the font color
  context.textAlign = "right";                  // set align to right
  context.fillText(padNumber(score,4),screen_width-3,23);
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

// -----------------------------------------------------------------------------
// Etc. Utils
// -----------------------------------------------------------------------------

function gameOver()
{
  isGameOver = true;
  playSound("game_over");
  gameOverPromptTimer = 60;
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
