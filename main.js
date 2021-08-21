// Define game board width/height
const width=8;
const height=8;
const gridsize=50;

// Arsenal
var arsenal={used:0, total:24};

var generated=false;

// Record of ammo used during best successful clearance
var record=0;

// Has the current game finished
var finished=false;

// Game board array
var board=[];

var canvas=null;
var ctx=null;

// Lookup for board position in 2D array
function boardpos(x, y)
{
  return (y*width)+x;
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

  if (record>0)
    recordstr="Record "+record;

  document.getElementById("record").innerHTML=recordstr;
}

// Show what ammo we have
function showammo()
{
  document.getElementById("arsenal").innerHTML=arsenal.used;
}

// If possible use ammo and update counter
function useammo()
{
  if (arsenal.used==arsenal.total) return false;

  arsenal.used++;

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

  for (var y=0; y<height; y++)
    for (var x=0; x<width; x++)
      switch (board[boardpos(x, y)])
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

// Check for game being complete
function checkfinished()
{
  var statusstr="";

  // Check for end of game
  if ((checkfound()==3) || (arsenal.used==arsenal.total))
  {
    finished=true;

    if (checkfound()==3)
    {
      statusstr="COMPLETED - WELL DONE";
      if ((arsenal.used<record) || (record==0))
      {
        record=arsenal.used;
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

  // Don't allow more shots if this game has finished
  if (finished) return false;

  // Check we have ammo left
  if (arsenal.used==arsenal.total) return false;

  switch (board[boardpos(x,y)])
  {
    case 0:
      // Miss in a blank square - add a cross
      board[boardpos(x,y)]=200;
      redraw=true;
      break;

    case 102:
      // Hit on 2 sized entity - mark as hit
      board[boardpos(x,y)]+=100;
      redraw=true;
      break;

    case 103:
      // Hit on 3 sized entity - mark as hit
      board[boardpos(x,y)]+=100;
      redraw=true;
      break;

    case 104:
      // Hit on 4 sized entity - mark as hit
      board[boardpos(x,y)]+=100;
      redraw=true;
      break;

    default:
      break;
  }

  if (redraw)
  {
    useammo();
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
  for (var y=0; y<height; y++)
    for (var x=0; x<width; x++)
    {
      ctx.fillStyle="#000000";

      switch(board[boardpos(x,y)])
      {
        case 102:
          //ctx.fillStyle="#FF0000";
          break;

        case 103:
          //ctx.fillStyle="#00FF00";
          break;

        case 104:
          //ctx.fillStyle="#0000FF";
          break;

        case 200:
          //ctx.fillStyle="#FFFF00";
          drawsplat(x, y, '#18d618');
          continue;
          break;

        case 202:
        case 203:
        case 204:
          //ctx.fillStyle="#FFA500";
          drawsplat(x, y, '#ef2d76');
          continue;
          break;
  
        default:
          break;
      }
      ctx.fillRect(x*gridsize, y*gridsize, gridsize, gridsize);
    }
}

// Handle clicks on canvas
function canvasclick(cx, cy)
{
  var x=cx-(canvas.offsetLeft+canvas.clientLeft);
  var y=cy-(canvas.offsetTop+canvas.clientTop);
  
  if (!generated)
  {
    generateboard();
    generated=true;
  }

  fire(Math.floor(x/(canvas.clientWidth/8)), Math.floor(y/(canvas.clientWidth/8)));
}

// See if an item will fit at given x,y position and given length/orientation
function fits(x, y, itemlength, orientation)
{
  // Iterate over all proposed item element
  for (var i=0; i<itemlength; i++)
  {
    if (orientation==0)
    {
      // Check vertical
      if ((x>=width) || (y+i>=width)) return false;
      if (board[boardpos(x, y+i)]>100) return false;
    }
    else
    {
      // Check horizontal
      if ((x+i>=width) || (y>=width)) return false;
      if (board[boardpos(x+i, y)]>100) return false;
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
    var orientation = Math.floor(rng()*1000) % 2;
    var x = Math.floor(rng() * width);
    var y = Math.floor(rng() * height);

    // If it fits at this random position, then we're all good
    if (fits(x, y, itemlength, orientation))
      break;
  }

  // Place item where we found a space
  for (var i=0; i<itemlength; i++)
    if (orientation == 0)
      board[boardpos(x, y+i)] = 102 + itemnumber;
    else
      board[boardpos(x+i, y)] = 102 + itemnumber;
}

// Generate a new board, using prng
function generateboard()
{
  // Empty the board first
  for (var y=0; y<height; y++)
    for (var x=0; x<width; x++)
      board[boardpos(x, y)]=0;

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
  finished=false;

  // Attempt to get decentralized random data from drand
  //updatedrand();

  // Generate board
  generateboard();

  // Show the board on screen
  showboard();

  arsenal.used=0;
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
 }
 else
 {
   newy=window.innerHeight;
   newx=window.innerHeight*aspectratio;
 }

  document.getElementById("inner").style.width=newx+"px";
  document.getElementById("inner").style.height=newy+"px";
}

function drawsplat(x, y, style)
{
  var cx, cy, cr, sx, sy;
  var nspill=11;
  var spills=[];
  var i;
  
  cx=Math.floor((x*gridsize)+(gridsize/2))+Math.floor(rng()*2);
  cy=Math.floor((y*gridsize)+(gridsize/2))+Math.floor(rng()*2);
  cr=gridsize*(0.28);
  
  // Draw central splat
  ctx.fillStyle=style;
  ctx.beginPath();
  ctx.arc(cx, cy, cr, 0, 2*Math.PI);
  ctx.fill();
  
  // Generate spills
  for (i=0; i<nspill; i++)
  {
    spills[i]={
      x:cx, // Start x position
      y:cy, // Start y position
      a:(Math.floor(rng()*30)*12), // Angle to eminate from
      r:Math.floor(cr*((rng()*0.17)+0.24)), // Radius of spill
      d:Math.floor(cr*2*((rng()*0.10)+0.56)) // Distance from start for where to finish up
    };
    
    // Draw spill
    sx=spills[i].d*Math.cos(spills[i].a);
    sy=spills[i].d*Math.sin(spills[i].a);
    ctx.beginPath();
    ctx.arc(cx+sx, cy+sy, spills[i].r, 0, 2*Math.PI);
    ctx.fill();
    
    console.log(spills[i]);
  }
}

function advancerng()
{
  var a=rng();
  showboard();
  window.requestAnimationFrame(advancerng);
}

// Startup called once when page is loaded
function startup()
{
  window.requestAnimationFrame(advancerng);

  canvas=document.getElementById("board");
  ctx=canvas.getContext("2d");

  canvas.addEventListener('click', function(event) { canvasclick(event.pageX, event.pageY); }, false);

  resetgame();

  // Handle resizing and device rotation
  window.onresize=resize;
  resize();
}

// Run the startup() once page has loaded
window.onload=function() { startup(); };
