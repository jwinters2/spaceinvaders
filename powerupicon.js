// -----------------------------------------------------------------------------
// Powerup Icon
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
