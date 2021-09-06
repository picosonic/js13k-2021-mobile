// Sprite generator, takes SVG DOM element and converts into an image for display on a canvas
class spritelib
{
  constructor()
  {
    this.sprites={};
    this.deffered=[];
  }

  checkdeffered(name)
  {
    for (var i=0; i<this.deffered.length; i++)
    {
      var spr=this.deffered[i];
      
      if (spr.name==name)
      {
        this.draw(spr.name, spr.ctx, spr.x, spr.y, spr.width, spr.height);
        this.deffered.splice(i, 1);
        i--;
      }
    }
  }

  // Handler for sprites which have been created
  loaded(name)
  {
    // Tidy up
    delete this.sprites[name].xml;
    delete this.sprites[name].elem;

    // Call the callback if specified
    if (this.sprites[name].callback!=undefined)
      this.sprites[name].callback(this.sprites[name]);
      
    this.checkdeffered(name);
  }
  
  // Generate an image from SVG content
  generate(name, content, callback=undefined)
  {
    var that=this;
    
    // Initialise
    this.sprites[name]={};
    this.sprites[name].name=name;
    this.sprites[name].elem=document.createElement("div");
    this.sprites[name].img=new Image();
    
    // Store callback function if specified
    if (callback!=undefined)
      this.sprites[name].callback=callback;

    // Start the conversion
    this.sprites[name].elem.innerHTML=content;
    this.sprites[name].xml=new XMLSerializer().serializeToString(this.sprites[name].elem.firstChild);

    // When the image has loaded from the b64, store the sprite and optionally run the callback
    this.sprites[name].img.onload=function () { that.loaded(name); };
    this.sprites[name].img.src='data:image/svg+xml;base64,'+btoa(this.sprites[name].xml);
  }

  // Draw a named sprite at a certain x/y/width/height
  draw(name, ctx, x, y, width, height)
  {
    // Check for deferred draw - draw once ready
    if (this.sprites[name]==undefined)
    {
      this.deffered.push({name:name, ctx:ctx, x:x, y:y, width:width, height:height});
      return;
    }
    
    if (width!=undefined)
      ctx.drawImage(this.sprites[name].img, x, y, width, height);
    else
      ctx.drawImage(this.sprites[name].img, x, y);
  }
}
