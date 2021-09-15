# Dev Diary / Postmortem

I've decided to attempt 2 entries to JS13k this year, this entry will concentrate on being playable on desktop and mobile.

I've put my initial interpretation of the theme and game ideas in my [main entry](https://github.com/picosonic/js13k-2021).

Here is a rough diary of progress as posted on [Twitter](https://twitter.com/femtosonic) and taken from notes and [commit logs](https://github.com/picosonic/js13k-2021/commits/)..

13th August
-----------
For my second attempt at an entry for 2021, I'd like to explore a simple but addictive game which can be played on both mobile and desktop and which may include an element of decentralisation. I'm going to start with a flat 2D game, but may add a 3D aspect to it if time allows.


![Playfield generator](aug13.gif?raw=true "Playfield generator")

This is my quick test of playfield generation.

14th August
-----------
I've decided to name the game Crater Space. Your aim is to create a space within a crater for a moon lander.

15th August
-----------
Stopped debug playfield generator. Added arsenal display (bombs used), indicator of hit/miss on board, items destroyed indicator, best clearance record (least used shots to find everything). Added game finished detection with option to replay. Converted from table to canvas.

21st August
-----------
Hid the targets so that you now have to play to find them. Show shots as splats on the grid. Made the game more random by progressing the prng every frame, also only generate first grid after user click.

![Splatting battleships](aug21.gif?raw=true "Splatting battleships")

1st September
-------------
Added orientation sensitive placement of canvas areas.

Added storing/retrieving of the record number of misses before completion into localstorage.

2nd September
-------------
Improved display of remaining arsenal. Using assets from [Kenney.nl](https://www.kenney.nl/assets/space-shooter-extension)

Added sprites for enemy ships and splat bombs.

3rd September
-------------
Added SVG sprite library whih converts them to bitmaps for rendering to canvas, with optional callback.

Added timeline library from previous js13k entry.

Code refactoring, moved vars into gamestate object.

5th September
-------------
Don't keep redrawing splats once complete.

When revealing enemies, draw them semi-transparently.

6th September
-------------
Refactoring to draw more to the same canvas.

Keep game board portrait and scale appropriately.

Show arsenal and enemies graphically.

7th September
-------------
Updated timeline lib to add callbacks being called with percentage complete.

Added UI canvas.

Added game state machine.

Improved look of record of best score and play again prompt.

Keep track of [drand](https://drand.love/) usage (decentralised RNG beacon).

Added initial choice between normal and decentralised RNG, with fallback on error.

Added display of missed shots.

8th September
-------------
Added confetti upon completion.

Added screenshots.

Looking back
------------
This was a fun game to make as I'd wanted to do a mobile first game that I could play on-the-go for a while.

I started with a top down view of an 8x8 grid onto which are randomly placed entities of 2, 3 and 4 gridsquares long in either vertical or horizontal alignment. The algorithm for the positioning of these and the RNG used were based on the minigame [Sploosh Kaboom](https://www.youtube.com/watch?v=1hs451PfFzQ) in [The Legend of Zelda: The Wind Waker](https://en.wikipedia.org/wiki/The_Legend_of_Zelda:_The_Wind_Waker) and the videos on creating a tool to use in speedruns.

I then had the idea to mix things up a bit by using splats of paint like in [Splatoon](https://www.nintendo.com/games/detail/splatoon-2-switch/) which you fire from above onto the grid and different colours would indicate hits or misses of the hidden entities. The splats have a large central circular splat, then 11 smaller splats which eminate from teh centre of the large splat at random postions (30' apart - like on a clock face), and at random sizes ranging from 7% to 24% of the size of the central splat. These smaller splats then leave trails as they move away from the central splat to their target resting position of between 56% and 75% of the central circle size. As they travel along this path their size decreases slightly then back up again to leave a stretched out streak of paint.

I had very simple indicators of the number of shorts used and the number of whole entities uncovered, so then went on to stylise those as an arsenal of splat missiles which change to black and white upon use, and a set of spaceships which also go black and white once all their component grid squares have been discovered.

My son indicated in play testing that it felt unfair that when you got a hit that it counted against you as there was not real reward for finding them. So I adjusted the logic so that only misses are counted.

I decided to write a mini sprite library so that I could draw SVG elements and make them look pixelated, I wrote some code to render the SVG to an image via an XML serializer into a data url with b64 encoding. This worked quite well once I'd got the callbacks and timings working correctly.

The craters in the background are actually fully formed 3D models generated on the fly based on a real crater side profile which is rotated around a central point. I did originally want to tilt this up and down slightly as the game played out, to give you a sense of depth. I was also going to create some simple 3D models of rocks or satellites to drift across your view and use the 3D library for those. Ultimately I decided these may be too busy/distracting.

Given that this year there was a new decentralised cateogry, I wanted to see if I could include some element of this into my game. I decided to use the [drand](https://drand.love/) (decentralised RNG beacon) as a source of entropy to feed my pRNG with a set of initial values which then go on to place the entities and form the splat generation algorithm.

Once I had a way to play and either win/fail with a retry, I decided that there should be some form of celebration. Having played [Triska Reloaded](https://triska.js13kgames.com/) the JS13k 10th year anniversary game I loved the confetti effect upon getting a new height record. So I added a confetti fountain which is gold for new records or multi-coloured for just finding all the hidden entities in any amount of missed splats.

Plus your best score is stored in localStorage to give you something to beat next time you play.
