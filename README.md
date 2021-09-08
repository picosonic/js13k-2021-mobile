# js13k-2021-mobile
JS13KGames entry for 2021 (mobile), theme is "**SPACE**".

## Crater Space
On the moon of planet Figadore the Regolith starships have returned, but they are using advanced cloaking techniques to remain invisible. You must discover the hiding place of the last 3 remaining starships by firing splat missiles.

Green splat indicates a miss and pink splat indicates a hit. You have 24 missiles, but hits don't count. Once each ship is fully covered in splat, one of the finder indicators changes to black.

Try to find all three starships (2, 3 and 4 grid squares in length) in the least misses possible.

Optimised for mobile in portrait. At the start you have the choice of using a Protocol Labs decentralized distributed randomness beacon as the seed.

# Stuff I managed to add
* 2D top down crater splat game
* Primary target of mobile
* Desktop support
* Portrait aspect ratio
* Low resolution pixelated retro feel
* SVG fonts to get a 3D look
* SVG sprite library
* Improved timelines for animation
* Use of local storage for best score
* Confetti celebration upon completion
* 3D crater model generation using "[Solids of Revolution](https://en.wikipedia.org/wiki/Solid_of_revolution)" method (seen in Beebug magazine Vol.8 No.7 December 1989)
* [Wichmann-Hill pseudorandom number generator](https://en.wikipedia.org/wiki/Wichmann%E2%80%93Hill)

# Tools used
* [Ubuntu OS](https://www.ubuntu.com/)
* [vim](https://github.com/vim) text editor (also [gedit](https://github.com/GNOME/gedit) a bit)
* [Visual Studio Code](https://code.visualstudio.com/)
* [meld](https://github.com/GNOME/meld) visual diff/merge
* [Inkscape](https://github.com/inkscape/inkscape) SVG editor
* [GIMP](https://github.com/GNOME/gimp) image editor
* [MeshLab](https://github.com/cnr-isti-vclab/meshlab) 3D model viewer
* [YUI Compressor](https://github.com/yui/yuicompressor) JS/CSS compressor
* [Google closure compiler](https://developers.google.com/closure/compiler/docs/gettingstarted_app) JS minifier
* [advzip](https://github.com/amadvance/advancecomp) (uses [7-Zip](https://sourceforge.net/projects/sevenzip/files/7-Zip/) deflate to compress further)

# Stuff I'd have done with more time
- [ ] Add gamepad support
- [ ] Improve the visuals
- [ ] More animations and special effects
- [ ] Sound effects and music track
- [ ] Dripping splats
- [ ] Investigate WebGL instead of canvas

# Attribution of assets

_Using some assets from [Kenney.nl "Space Shooter Extension"](https://www.kenney.nl/assets/space-shooter-extension) (Creative Commons Zero, CC0 license)._

_Using code inspired by following a [tutorial](https://www.youtube.com/watch?v=XgMWc6LumG4) from @Javidx9._
