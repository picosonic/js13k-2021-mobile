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
  titlecanvas:null,
  titlectx:null,

  // 3D library
  threedee:null,

  // SVG sprites converted to bitmaps
  sprites:new spritelib(),

  img:new Image(),

  devorientation:"landscape",

  timeline:new timelineobj(),
};

// Lookup for board position in 2D array
function boardpos(x, y)
{
  return (y*dimension)+x;
}

// Show a new status string
function showstatus(statusstr)
{
  document.getElementById("status").innerHTML=statusstr;
}

// Show best use of ammo to clear everything
function showrecord()
{
  var recordstr="";

  if (gs.record>0)
    recordstr="Record "+gs.record;

  document.getElementById("record").innerHTML=recordstr;
}

// Show what ammo we have
function showammo()
{
  var out="";
  var i;

  for (i=0; i<gs.arsenal.total; i++)
  {
    if (i<gs.arsenal.used)
      out+=bombsprite.replace('#36bbf5', '#333').replace('#1884b4', '#222').replace('#78888c','#444').replace('#bdd6db','#555').replace('#a1b6bb','#666');
    else
      out+=bombsprite;
  }

  document.getElementById("arsenal").innerHTML=out;
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
    if (i<found) foundstr+="X "; else foundstr+="[] ";

  document.getElementById("found").innerHTML=foundstr;

  return found;
}

function showenemies()
{
  for (var i=0; i<gs.enemies.length; i++)
    gs.sprites.draw("enemy", gs.boardctx, gs.enemies[i].x*gridsize, gs.enemies[i].y*gridsize, gs.enemies[i].dir==0?gridsize:gridsize*gs.enemies[i].len, gs.enemies[i].dir!=0?gridsize:gridsize*gs.enemies[i].len);
}

// Check for game being complete
function checkfinished()
{
  var statusstr="";

  // Check for end of game
  if ((checkfound()==3) || (gs.arsenal.used==gs.arsenal.total))
  {
    gs.finished=true;
    showenemies();

    if (checkfound()==3)
    {
      statusstr="COMPLETED - WELL DONE";
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
    else
      statusstr="TRY AGAIN";

    statusstr+=" <button onclick='resetgame()'>MORE</button>";

    showstatus(statusstr);
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
  
  if (!gs.generated)
  {
    generateboard();
    gs.generated=true;
  }

  fire(Math.floor(x/(gs.boardcanvas.clientWidth/8)), Math.floor(y/(gs.boardcanvas.clientWidth/8)));
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
  // Set up
  return new Promise(function(resolve, reject)
    {
      var req = new XMLHttpRequest();

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

            catch(e) {}
          }
        }
      };

      // Something went wrong
      req.onerror = function()
      {
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
  gs.boardctx.clearRect(0, 0, 400, 400);

  // Draw targetting grid
  for (var ts=0; ts<=dimension; ts++)
  {
    gs.boardctx.beginPath();
    gs.boardctx.moveTo(ts*gridsize, 0);
    gs.boardctx.lineTo(ts*gridsize, gridsize*dimension);
    gs.boardctx.stroke();

    gs.boardctx.beginPath();
    gs.boardctx.moveTo(0, ts*gridsize);
    gs.boardctx.lineTo(gridsize*dimension, ts*gridsize);
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

  showstatus("");
}

// Action a browser resize
function resize()
{
 var aspectratio=400/400;
 var newx, newy;

 if ((window.innerWidth/window.innerHeight)<aspectratio)
 {
   newx=window.innerWidth;
   newy=window.innerWidth/aspectratio;
   gs.devorientation="portrait";
 }
 else
 {
   newy=window.innerHeight;
   newx=window.innerHeight*aspectratio;
   gs.devorientation="landscape";
 }

  gs.boardcanvas.style.width=newx+"px";
  gs.boardcanvas.style.height=newy+"px";
  gs.boardcanvas.setAttribute("orientation", gs.devorientation);

  gs.threedee.canvas.style.width=newx+"px";
  gs.threedee.canvas.style.height=newy+"px";
  gs.threedee.canvas.setAttribute("orientation", gs.devorientation);

  gs.titlecanvas.style.width=newx+"px";
  gs.titlecanvas.style.height=newy+"px";
  gs.titlecanvas.setAttribute("orientation", gs.devorientation);
}

function drawspill(x, y, style)
{
  var cx, cy, cr, sx, sy;
  var nspill=11;
  var thisspill=[];
  var sp=boardpos(x, y);
  var i;

  cx=Math.floor((x*gridsize)+(gridsize/2))+Math.floor(rng()*2);
  cy=Math.floor((y*gridsize)+(gridsize/2))+Math.floor(rng()*2);
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
  }
}

// Move on to next number in pRNG generation
function advancerng()
{
  var a=rng();
  showboard();
  window.requestAnimationFrame(advancerng);
}

// Draw the game title
function drawtitle(sprite)
{
  gs.titlectx.drawImage(sprite.img, 0, 0, 600, 100);
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
  gs.titlecanvas=document.getElementById("title");
  gs.titlectx=gs.titlecanvas.getContext("2d");

  // Make sure we pixelate upon scaling
  gs.boardctx.imageSmoothingEnabled=false;
  gs.boardctx.mozimageSmoothingEnabled=false;
  gs.titlectx.imageSmoothingEnabled=false;
  gs.titlectx.mozimageSmoothingEnabled=false;
  
  gs.boardcanvas.addEventListener('click', function(event) { canvasclick(event.pageX, event.pageY); }, false);

  resetgame();
  
  gs.sprites.generate("enemy", enemysprite);
  gs.sprites.generate("bomb", bombsprite);
  gs.sprites.generate("title", titlewrite(0, 0, 100, "CRATER SPACE"), drawtitle);
 
  // Handle resizing and device rotation
  resize();
  window.addEventListener("resize", resize);
}

// Run the startup() once page has loaded
window.onload=function() { startup(); };
