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
