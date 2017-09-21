# raindrop

To add to your project, add the following to your index.html file:

    <script src="https://littlegustv.github.io/raindrop/releases/raindrop2017-08-25.js"></script>

Or download the release of your choice from [the github repository](https://github.com/littlegustv/raindrop/tree/gh-pages/releases "yeah!")

# Setting up a new project

#### Folder structure

The default structure looks like this:

    / project
      - index.html
      - game.js
      - index.json
      /res
      /scenes
`/res` contains image and sound resources, while `/scenes` contains your scene files.  `index.json` is where you define your resources, and `game.js` contains the game startup code, and whatever custom global game logic you wish to create.

##### index.html
    <html>
    <head>
      <script src="https://littlegustv.github.io/raindrop/releases/raindrop2017-08-25.js"></script>
      <script src="./game.js"></script>
       <!-- add mobile viewpoint meta tags here, if needed -->
    </head>
    <body></body>
    </html>
    
##### index.json  
    {
      "scenes": [
        {
          "name": "menu.js",
          "reload": true
        },
        {
          "name": "level1.js",
          "reload": true
        }    
      ],
      "resources": [
        {"path": "bicycle.png", "frames": 2, "speed": 0.4, "animations": 1},
        {"path": "ground.png"},
        {"path": "jump.wav"},
        {"path": "soundtrack.ogg"},
        {"path": "levels.json"}
      ],
      "fontFamily": "Visitor"
    }
    
##### game.js
    var game = Object.create(World).init(320, 180, "index.json"); /* that's it! */
    
#### Scenes

The game does nothing without scenes i.e. levels, layouts, etc.  Each scene has a very basic structure, and is loaded from `.js` files in the `/scenes` folder.

    /* onStart initializes the scene whenever it is loaded.  this is where most of your game objects will be created */
    var onStart = function () {
      /* first, add a drawing 'layer' */
      var background = this.add(Object.create(Layer).init(320,180));
      
      /* there are a large number of possible game objects - from a generic 'Entity' to Sprites, TiledBackgrounds, etc. */
      var bike = background.add(Object.create(Sprite).init(Resources.bicycle)).set({x: 100, y: 20, velocity: {x: 10, y: 0}});
      
      /* there are pre-built behaviors, but you can also create your own
      bike.add(Velocity);
      
      /* event listeners are specific to each scene, so need to be defined here:
      this.onClick = function (e) {
        bike.velocity.x *= -1;
      }
    
    }
    
    /* onUpdate is for scene-wide updates occurring every tick.  in practice, most of this logic may be handled by individual behaviors, but it can still be useful
    var onUpdate = function (dt) {
    
    }
