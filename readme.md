
# BlockJS
An open source Minecraft clone that can be run in your browser and potentially in your school. This game uses WebGL 2, which is 
based from OpenGL ES 3.0. <!--It also works offline, so you don't have to worry about internet problems unless you're playing multiplayer. (code not implemented)-->
This game is inspired by MineKhan, which you can play at https://willard.fun/minekhan. Note that I made this game from
scratch, so there's really nothing I took from MineKhan.

I made it so it also supports multiplayer, but to host the server, you might have to do a bit of tinkering with Node.js and
WebSocket. Fortunately there is already a pre-made server to download in my GitHub repository.

Note that if you're playing on Khan Academy it will be a bit slower to load due to putting the whole game in one
page.

**Controls:**
- W: Move forward
- A: Move left
- S: Move backward
- D: Move right
- Space: Jump (not implemented)
- Esc: Pause


And yes, it's still in development as the game is really buggy and feature-lacking. As more time passes, expect new
features in the game.

You can add it to your game list and modify it as well it's licensed under the MIT license.
## Compiling
### Client
First, download and install the necessary packages through `npm install`. Then, simply run `npm run build` to compile the client. The output file will be at `./dist/bundle.js`.
### Server
There isn't a "compile" process for the server, although you can just modify the code directly.

## BlockJS Server
It's the corresponding server to the client. Currently it is shipped as a CLI so basically clone this repository, and run the following lines to set up the server:

```bat
cd server
"<list of your players" > "ops.txt"
blockjs --server --port=<port>
```

This will start the server which you can access by joining at `ws://localhost:<port>`.

For now, it isn't published as a `npm` package, so you have to publish it yourself.

## Modding
Just so you know, BlockJS has modding support, although it's a bit involved and rudimentary at the time. So basically, follow these steps:

First, you want to create a directory and add a file called index.js like here:
```
<root directory>
      |
      |
      |----- index.js
```

Then, you just have to simply include this comment at the very top of the file:
```js
/** 
 * @blockjs @declaration
 * @requestObjects BlockJS
 */
```
Now, just write whatever code you like.
## Attribution
This project uses [JSZip](https://github.com/Stuk/jszip) and [gl-matrix](https://github.com/toji/gl-matrix) for the mod loading and renderin, respectively.