// Define game board dimensions
const dimension=8;
const gridsize=50;

// Game state is global to prevent it going out of scope
var gs={
  // Arsenal of weapons
  arsenal:{used:0, total:24},

  // Record of ammo used during best successful clearance
  record:0,

  // Has the initial game board generation been done
  generated:false,

  // Has the current game finished
  finished:false,

  // Game board array
  board:[],

  // Enemy positions
  enemies:[],

  // Spills from splats
  spills:[],

  // HTML5 canvases and their contexts
  boardcanvas:null,
  boardctx:null,
  uicanvas:null,
  uictx:null,
  
  // Position offsets
  boardx:0,
  boardy:65,
  boardscale:1,

  // 3D library
  threedee:null,

  // SVG sprites converted to bitmaps
  sprites:new spritelib(),

  // Device orientation
  devorientation:"landscape",

  // Timeline library used for animation
  timeline:new timelineobj(),
  
  // If using drand decentralised random beacon
  usingdrand:false,
  
  state:0, // 0=Intro 1=Menu 2=InPlay 3=Finished
};

// Lookup for board position in 2D array
function boardpos(x, y)
{
  return (y*dimension)+x;
}

function uiclick(cx, cy)
{
  var x=cx-(gs.uicanvas.offsetLeft+gs.uicanvas.clientLeft);
  var y=cy-(gs.uicanvas.offsetTop+gs.uicanvas.clientTop);

  // Recalibrate to remove scaling of ui
  x/=gs.boardscale;
  y/=gs.boardscale;

  switch (gs.state)
  {
    case 1: // Menu
      if ((x>=110) && (x<=325) && (y>=100) && (y<=180))
      {
        // Normal game
        gs.state=2;
        resetgame();
      }
      else
      if ((x>=110) && (x<=325) && (y>=300) && (y<=380))
      {
        // Decentralised game (using drand)
        updatedrand();
      }
      break;

    case 3: // Finished
      if ((x>=110) && (x<=325) && (y>=600) && (y<=680))
      {
//        var a=rng();
        gs.state=2;
        resetgame();
      }
      break;
      
    default:
      break;
  }
}

// Attract
function attract(percent)
{
  gs.uicanvas.style.transform="scale("+gs.boardscale+") translate(0px, "+(percent<50?Math.floor((percent/8)):Math.floor((12-(percent/8))))+"px)";
}

// Show ui
function showui()
{
  switch (gs.state)
  {
    case 0: // Intro
      gs.state=1; showui(); // TODO
      break;

    case 1: // Menu
      gs.uictx.clearRect(0, 0, xmax, ymax);
      gs.uicanvas.style.zIndex=3;

      gs.uictx.fillStyle="rgba(0,0,0,0.8)";
      gs.uictx.fillRect(0, 0, xmax, ymax);
      gs.uictx.fillStyle="black";

      // Draw PLAY and PLAY decentralised button
      var grd=gs.uictx.createLinearGradient(110, 100, 110, 180);
      grd.addColorStop(0, "#fceb08");
      grd.addColorStop(0.5, "#f2137b");
      grd.addColorStop(1, "#25145a");

      gs.uictx.fillStyle=grd;
      gs.uictx.fillRect(110, 100, 215, 80);
      
      gs.uictx.font="bold 52px Arial";
      gs.uictx.fillStyle="white";
      gs.uictx.fillText("PLAY", 145, 160);
      gs.uictx.fillStyle="black";

      var grd2=gs.uictx.createLinearGradient(110, 300, 110, 380);
      grd2.addColorStop(0, "#0b68a4");
      grd2.addColorStop(0.48, "#c1eaf8");
      grd2.addColorStop(0.5, "#ffffff");
      grd2.addColorStop(0.52, "#9b3c0a");
      grd2.addColorStop(0.75, "#fcca31");
      grd2.addColorStop(0.99, "#fbe69d");
      grd2.addColorStop(1, "#ffffff");

      gs.uictx.fillStyle=grd2;
      gs.uictx.fillRect(110, 300, 215, 80);
      
      gs.uictx.fillStyle="white";
      gs.uictx.font="bold 52px Arial";
      gs.uictx.fillText("PLAY", 145, 350);
      gs.uictx.fillStyle="#f2137b";
      gs.uictx.font="bold 14px Arial";
      gs.uictx.fillText("decentralised", 165, 370);
      gs.uictx.fillStyle="black";
      break;

    case 2: // InPlay
      clearui();
      break;

    case 3: // Finished
      gs.uictx.clearRect(0, 0, xmax, ymax);
      gs.uicanvas.style.zIndex=3;

      // Draw result and retry button
      var grd=gs.uictx.createLinearGradient(110, 600, 110, 680);
      grd.addColorStop(0, "#262262");
      grd.addColorStop(1, "#ef2d76");

      gs.uictx.fillStyle=grd;
      gs.uictx.fillRect(110, 600, 215, 80);
      
      gs.uictx.font="bold 34px Arial";
      gs.uictx.fillStyle="white";
      gs.uictx.fillText("PLAY AGAIN", 115, 650);
      gs.uictx.fillStyle="black";

      gs.timeline.reset();
      gs.timeline.add(1000, undefined);
      gs.timeline.addcallback(attract);
      gs.timeline.begin(0); // Loop continuously
      break;

    default:
      gs.state=0; showui();
      break;
  }
}

// Clear ui and demote Z-index
function clearui()
{
  gs.uictx.clearRect(0, 0, xmax, ymax);
  gs.uicanvas.style.zIndex=1;

  gs.timeline.end();
  gs.uicanvas.style.transform="scale("+gs.boardscale+")";
}

// Show best use of ammo to clear everything
function showrecord()
{
  if (gs.record>0)
  {
    var h=20;
    var w=115;
    var x=280;
    var y=530;
    var fs=Math.floor(h*0.9);
    var recordstr="RECORD "+gs.record;
    var grd=gs.boardctx.createLinearGradient(x, y, x, y+h);
    grd.addColorStop(0, "#ffed41");
    grd.addColorStop(1, "#febf04");

    gs.boardctx.save();

    gs.boardctx.clearRect(x-8, y-8, w+16, h+16);
    gs.boardctx.fillStyle=grd;
    gs.boardctx.shadowColor="rgba(0,0,0,0.8)";
    gs.boardctx.shadowBlur=5;
    gs.boardctx.fillRect(x, y, w, h);

    gs.boardctx.restore();

    gs.boardctx.font="bold "+fs+"px Arial";
    gs.boardctx.fillStyle="black";
    gs.boardctx.fillText(recordstr, x+5, y+fs-1);
  }
}

// Show what ammo we have
function showammo()
{
  for (var i=0; i<gs.arsenal.total; i++)
  {
    if (i<gs.arsenal.used)
      gs.sprites.draw("spentbomb", gs.boardctx, 16*i, 480, 16, 40);
    else
      gs.sprites.draw("bomb", gs.boardctx, 16*i, 480, 16, 40);
  }
}

// If possible use ammo and update counter
function useammo()
{
  if (gs.arsenal.used==gs.arsenal.total) return false;

  gs.arsenal.used++;

  showammo();

  return true;
}

// Check number of found items
function checkfound()
{
  var found=0;
  var found102=0;
  var found103=0;
  var found104=0;
  var foundstr="";

  for (var y=0; y<dimension; y++)
    for (var x=0; x<dimension; x++)
      switch (gs.board[boardpos(x, y)])
      {
        case 202: found102++; break;
        case 203: found103++; break;
        case 204: found104++; break;

        default:
          break;
      }
  
  if (found102==2) found++;
  if (found103==3) found++;
  if (found104==4) found++;

  for (var i=0; i<3; i++)
    if (i<found)
      gs.sprites.draw("foundenemy", gs.boardctx, 5, 540+(i*45), 40, 40);
    else
      gs.sprites.draw("enemy", gs.boardctx, 5, 540+(i*45), 40, 40);

  return found;
}

function showenemies()
{
  gs.boardctx.save();
  gs.boardctx.globalAlpha=0.5;

  for (var i=0; i<gs.enemies.length; i++)
    gs.sprites.draw("enemy", gs.boardctx, gs.boardx+(gs.enemies[i].x*gridsize), gs.boardy+(gs.enemies[i].y*gridsize), gs.enemies[i].dir==0?gridsize:gridsize*gs.enemies[i].len, gs.enemies[i].dir!=0?gridsize:gridsize*gs.enemies[i].len);

  gs.boardctx.restore();
}

// Check for game being complete
function checkfinished()
{
  // Check for end of game
  if ((checkfound()==3) || (gs.arsenal.used==gs.arsenal.total))
  {
    gs.finished=true;
    showenemies();

    if (checkfound()==3)
    {
      if ((gs.arsenal.used<gs.record) || (gs.record==0))
      {
        gs.record=gs.arsenal.used;
        try
        {
          window.localStorage.craterspace_record=gs.record;
        }
        catch (e) {}
        showrecord();
      }
    }
    gs.state=3;

    showui();
  }
}

// Board fireed upon
function fire(x, y)
{
  var redraw=false;
  var hit=false;

  // Don't allow more shots if this game has finished
  if (gs.finished) return false;

  // Check we have ammo left
  if (gs.arsenal.used==gs.arsenal.total) return false;

  switch (gs.board[boardpos(x,y)])
  {
    case 0:
      // Miss in a blank square - add a cross
      gs.board[boardpos(x,y)]=200;
      redraw=true;
      break;

    case 102:
      // Hit on 2 sized entity - mark as hit
      gs.board[boardpos(x,y)]+=100;
      redraw=true; hit=true;
      break;

    case 103:
      // Hit on 3 sized entity - mark as hit
      gs.board[boardpos(x,y)]+=100;
      redraw=true; hit=true;
      break;

    case 104:
      // Hit on 4 sized entity - mark as hit
      gs.board[boardpos(x,y)]+=100;
      redraw=true; hit=true;
      break;

    default:
      break;
  }

  if (redraw)
  {
    if (!hit) useammo();
    checkfound();

    checkfinished();

    showboard();
  }
}

// Show the board on-screen
function showboard()
{
  var n=0;

  // Build up some HTML for a quick table to visualise board
  for (var y=0; y<dimension; y++)
    for (var x=0; x<dimension; x++)
    {
      gs.boardctx.fillStyle="#000000";

      switch(gs.board[boardpos(x,y)])
      {
        case 102:
          //gs.boardctx.fillStyle="#FF0000";
          break;

        case 103:
          //gs.boardctx.fillStyle="#00FF00";
          break;

        case 104:
          //gs.boardctx.fillStyle="#0000FF";
          break;

        case 200:
          //gs.boardctx.fillStyle="#FFFF00";
          drawspill(x, y, '#18d618');
          continue;
          break;

        case 202:
        case 203:
        case 204:
          //gs.boardctx.fillStyle="#FFA500";
          drawspill(x, y, '#ef2d76');
          continue;
          break;
  
        default:
          break;
      }
      //gs.boardctx.fillRect(x*gridsize, y*gridsize, gridsize, gridsize);
    }
}

// Handle clicks on canvas
function canvasclick(cx, cy)
{
  var x=cx-(gs.boardcanvas.offsetLeft+gs.boardcanvas.clientLeft);
  var y=cy-(gs.boardcanvas.offsetTop+gs.boardcanvas.clientTop);

  // Recalibrate to remove scaling of board
  x/=gs.boardscale;
  y/=gs.boardscale;

  // Recalibrate to where board is on canvas
  x-=gs.boardx;
  y-=gs.boardy;
  
  // Upon first interaction generate a boad using current pRNG state
  if (!gs.generated)
  {
    generateboard();
    gs.generated=true;
  }

  // If we are over the grid, register a shot at the grid
  if ((x>=0) && (y>=0) && (x<=(gridsize*8)) && (y<=(gridsize*8)))
    fire(Math.floor(x/gridsize), Math.floor(y/gridsize));
}

// See if an item will fit at given x,y position and given length/orientation
function fits(x, y, itemlength, direction)
{
  // Iterate over all proposed item element
  for (var i=0; i<itemlength; i++)
  {
    if (direction==0)
    {
      // Check vertical
      if ((x>=dimension) || (y+i>=dimension)) return false;
      if (gs.board[boardpos(x, y+i)]>100) return false;
    }
    else
    {
      // Check horizontal
      if ((x+i>=dimension) || (y>=dimension)) return false;
      if (gs.board[boardpos(x+i, y)]>100) return false;
    }
  }

  // No issues placing item here, so mark as OK
  return true;
}

// Place an item of given length on the board
function placeitem(itemnumber, itemlength)
{
  // Generate random positions/orientation until item fits
  while (1)
  {
    var direction = Math.floor(rng()*1000) % 2;
    var x = Math.floor(rng() * dimension);
    var y = Math.floor(rng() * dimension);

    // If it fits at this random position, then we're all good
    if (fits(x, y, itemlength, direction))
      break;
  }

  // Cache item location
  gs.enemies.push({x:x, y:y, dir:direction, len:itemlength });

  // Place item where we found a space
  for (var i=0; i<itemlength; i++)
    if (direction == 0)
      gs.board[boardpos(x, y+i)] = 102 + itemnumber;
    else
      gs.board[boardpos(x+i, y)] = 102 + itemnumber;
}

// Generate a new board, using prng
function generateboard()
{
  // Remove enemies cache
  gs.enemies=[];

  // Empty the board first
  for (var y=0; y<dimension; y++)
    for (var x=0; x<dimension; x++)
    gs.board[boardpos(x, y)]=0;

  // Place the items
  placeitem(0, 2);
  placeitem(1, 3);
  placeitem(2, 4);
}

// Use a decentralised random number source for seeding prng
function updatedrand()
{
  // Stop using frame based advance of pRNG
  gs.usingdrand=true;

  // Set up
  return new Promise(function(resolve, reject)
    {
      var req = new XMLHttpRequest();

      req.timeout=5000;
      req.open('GET', 'https://api.drand.sh/public/latest', true);

      // AJAX request has changed state
      req.onreadystatechange = function ()
      {
        if (req.readyState === 4) // AJAX done
        {
          if (req.status == 200) // Good response
          {
            // Parse the result
            try
            {
              var res = JSON.parse(req.responseText);

              // Extract 4 bytes of hex for each seed
              rng.s1=parseInt(res.randomness.substr(0,4), 16);
              rng.s2=parseInt(res.randomness.substr(4,4), 16);
              rng.s3=parseInt(res.randomness.substr(8,4), 16);
            }

            catch(e)
            {
              gs.usingdrand=false;
            }
          }
          else
            gs.usingdrand=false;

          gs.state=2;
          resetgame();
        }
      };

      // Something went wrong
      req.onerror = function()
      {
        // drand failed, so fallback to pRNG
        gs.usingdrand=false;
        
        gs.state=2;
        resetgame();
      };

      // Fire off the AJAX call
      req.send();
    });
}

function resetgame()
{
  gs.finished=false;
  gs.spills=[];

  // Clear canvas
  gs.boardctx.clearRect(gs.boardx, gs.boardy, gridsize*8, gridsize*8);

  // Draw targetting grid
  for (var ts=0; ts<=dimension; ts++)
  {
    gs.boardctx.beginPath();
    gs.boardctx.moveTo(gs.boardx+(ts*gridsize), gs.boardy);
    gs.boardctx.lineTo(gs.boardx+(ts*gridsize), gs.boardy+(gridsize*dimension));
    gs.boardctx.stroke();

    gs.boardctx.beginPath();
    gs.boardctx.moveTo(gs.boardx, gs.boardy+(ts*gridsize));
    gs.boardctx.lineTo(gs.boardx+(gridsize*dimension), gs.boardy+(ts*gridsize));
    gs.boardctx.stroke();
  }

  // Attempt to get decentralized random data from drand
  //updatedrand();

  // Generate board
  generateboard();

  // Show the board on screen
  showboard();

  gs.arsenal.used=0;
  showammo();

  checkfound();

  showrecord();

  showui();
}

// Action a browser resize
function resize()
{
  var height=window.innerHeight;
  var aspectratio=xmax/ymax;
  var ratio=xmax/ymax;
  var width=Math.floor(height*ratio);
  var top=0;
  var left=Math.floor((window.innerWidth/2)-(width/2));

  if (width>window.innerWidth)
  {
    width=window.innerWidth;
    ratio=ymax/xmax;
    height=Math.floor(width*ratio);

    left=0;
    top=Math.floor((window.innerHeight/2)-(height/2));
  }

  if ((window.innerWidth/window.innerHeight)<aspectratio)
    gs.devorientation="portrait";
  else
    gs.devorientation="landscape";

  gs.boardcanvas.style.top=top+"px";
  gs.boardcanvas.style.left=left+"px";
  gs.boardcanvas.style.transformOrigin='0 0';
  gs.boardcanvas.style.transform='scale('+(height/ymax)+')';

  gs.threedee.canvas.style.top=top+"px";
  gs.threedee.canvas.style.left=left+"px";
  gs.threedee.canvas.style.transformOrigin='0 0';
  gs.threedee.canvas.style.transform='scale('+(height/ymax)+')';

  gs.uicanvas.style.top=top+"px";
  gs.uicanvas.style.left=left+"px";
  gs.uicanvas.style.transformOrigin='0 0';
  gs.uicanvas.style.transform='scale('+(height/ymax)+')';

  gs.boardscale=(width/xmax);
}

function drawspill(x, y, style)
{
  var cx, cy, cr, sx, sy;
  var nspill=11;
  var thisspill=[];
  var sp=boardpos(x, y);
  var i;
  var numspilt=0;

  // Don't keep drawing the same spill
  if ((gs.spills[sp]!=undefined) && (gs.spills[sp].done))
    return;

  cx=gs.boardx+Math.floor((x*gridsize)+(gridsize/2))+Math.floor(rng()*2);
  cy=gs.boardy+Math.floor((y*gridsize)+(gridsize/2))+Math.floor(rng()*2);
  cr=gridsize*(0.28);
  
  // Draw central splat
  gs.boardctx.fillStyle=style;
  gs.boardctx.beginPath();
  gs.boardctx.arc(cx, cy, cr, 0, 2*Math.PI);
  gs.boardctx.fill();

  if (gs.spills[sp]==undefined)
  {
    // Generate spills
    for (i=0; i<nspill; i++)
    {
      thisspill[i]={
        x:cx, // Start x position
        y:cy, // Start y position
        t:Math.floor(rng()*20)*5, // Travel
        a:(Math.floor(rng()*30)*12), // Angle to eminate from
        r:Math.floor(cr*((rng()*0.17)+0.24)), // Radius of spill
        d:Math.floor(cr*2*((rng()*0.19)+0.56)) // Distance from start for where to finish up
      };
    }
    gs.spills[sp]=thisspill;
    gs.spills[sp].done=false;
  }

  // Draw spills
  for (i=0; i<nspill; i++)
  {
    if (gs.spills[sp][i].t<100)
    {
      // Draw spill
      var ss=gs.spills[sp][i].r;

      // Adjust spillage size based on travel
      if (gs.spills[sp][i].t>70)
        ss*=((Math.cos((30-(100-gs.spills[sp][i].t))/(30/(2*Math.PI)))+1)/2);

      // Adjust distance from centre based on travel time
      sx=(gs.spills[sp][i].d*(gs.spills[sp][i].t/100))*Math.cos(gs.spills[sp][i].a);
      sy=(gs.spills[sp][i].d*(gs.spills[sp][i].t/100))*Math.sin(gs.spills[sp][i].a);
      gs.boardctx.beginPath();
      gs.boardctx.arc(cx+sx, cy+sy, ss, 0, 2*Math.PI);
      gs.boardctx.fill();

      gs.spills[sp][i].t+=10;
    }
    else
      numspilt++;
  }

  // If all drips are done, then mark this splat as done so we don't keep drawing it
  if (numspilt==nspill)
    gs.spills[sp].done=true;
}

// Move on to next number in pRNG generation
function advancerng()
{
  if (!gs.usingdrand)
  {
    var a=rng();
  }

  // Show the board to get splat animations
  showboard();
  
  // Request that we are called again on the next frame
  window.requestAnimationFrame(advancerng);
}

// Draw the game title
function drawtitle(sprite)
{
  gs.sprites.draw("title", gs.boardctx, 0, -15, 600,100);
}

// Startup called once when page is loaded
function startup()
{
  // Try to retrieve record from local storage
  try
  {
    const bestrecord=window.localStorage.craterspace_record;
    if ((bestrecord!=null) && (bestrecord!=undefined))
      gs.record=parseInt(bestrecord, 10);
  }
  catch (e) {}

  gs.threedee=threedeeinit();
  gs.threedee.start();

  window.requestAnimationFrame(advancerng);

  gs.boardcanvas=document.getElementById("board");
  gs.boardctx=gs.boardcanvas.getContext("2d");

  gs.uicanvas=document.getElementById("ui");
  gs.uictx=gs.uicanvas.getContext("2d");

  // Make sure we pixelate upon scaling
  gs.boardctx.imageSmoothingEnabled=false;
  gs.boardctx.mozimageSmoothingEnabled=false;
  gs.uictx.imageSmoothingEnabled=false;
  gs.uictx.mozimageSmoothingEnabled=false;
    
  gs.boardcanvas.addEventListener('click', function(event) { canvasclick(event.pageX, event.pageY); }, false);
  gs.uicanvas.addEventListener('click', function(event) { uiclick(event.pageX, event.pageY); }, false);

  resetgame();
  
  gs.sprites.generate("enemy", enemysprite);
  gs.sprites.generate("foundenemy", enemysprite.replace('#ac3939','#333').replace('#bd3e3e','#222').replace('#eeeeee','#111'));
  gs.sprites.generate("bomb", bombsprite);
  gs.sprites.generate("spentbomb", bombsprite.replace('#36bbf5','#333').replace('#1884b4', '#222').replace('#78888c','#444').replace('#bdd6db','#555').replace('#a1b6bb','#666'));
  gs.sprites.generate("title", titlewrite(0, 0, 100, "CRATER SPACE"), drawtitle);
 
  // Handle resizing and device rotation
  resize();
  window.addEventListener("resize", resize);
}

// Run the startup() once page has loaded
window.onload=function() { startup(); };
