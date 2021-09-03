// Sprite generator, takes SVG DOM element and converts into an image for display on a canvas
class spritelib
{
  constructor()
  {
    this.sprites=[];
  }

  // Handler for sprites which have been created
  loaded(newspr)
  {
    // Tidy up
    delete newspr.xml;
    delete newspr.elem;

    // Add loaded sprite to sprites array
    this.sprites.push(newspr);
  }

  // Generate an image from SVG content
  generate(name, content)
  {
    var newspr={
      name:name,
      elem:document.createElement("div"),
      img:new Image()
    };

    newspr.elem.innerHTML=content;
    newspr.xml=new XMLSerializer().serializeToString(newspr.elem.firstChild);
    newspr.img.src='data:image/svg+xml;base64,'+btoa(newspr.xml);
    newspr.img.onload=this.loaded(newspr);
  }

  // Draw a named sprite at a certain x/y/width/height
  draw(name, ctx, x, y, width, height)
  {
    for (var i=0; i<this.sprites.length; i++)
      if (this.sprites[i].name==name)
        if (width!=undefined)
	  ctx.drawImage(this.sprites[i].img, x, y, width, height);
	else
          ctx.drawImage(this.sprites[i].img, x, y);
  }
}
