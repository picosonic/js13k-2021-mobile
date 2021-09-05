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
