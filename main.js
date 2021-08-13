// Define game board width/height
const width=8;
const height=8;

// Game board array
var board=[];

// Lookup for board position in 1D array
function boardpos(x, y)
{
  return (y*width)+x;
}

// Show the board on-screen
function showboard()
{
  var out="<table>";

  // Build up some HTML for a quick table to visualise board
  for (var y=0; y<height; y++)
  {
    out+="<tr>";

    for (var x=0; x<width; x++)
    {
      // Colour background differently depending on item id
      switch (board[boardpos(x, y)])
      {
        case 0: // Blank empty space
          out+="<td style='background:black;'></td>";
          break;

        case 102: // 2 piece item
          out+="<td style='background:red;'></td>";
          break;

        case 103: // 3 piece item
          out+="<td style='background:green;'></td>";
          break;

        case 104: // 4 piece item
          out+="<td style='background:blue;'></td>";
          break;

        default: // Error catchall
          break;
      }
    }
    out+="</tr>";
  }
  out+="</table>";

  // Inject table into wrapper
  document.getElementById("wrapper").innerHTML=out;
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

  // Show the board on screen
  showboard();
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

// Startup called once when page is loaded
function startup()
{
  // Attempt to get decentralized random data from drand
  //updatedrand();

  // Generate board
  generateboard();

  // For debug - generate a new board every quarter of a second
  setInterval(function(){ generateboard(); }, 250);
}

// Run the startup() once page has loaded
window.onload=function() { startup(); };
