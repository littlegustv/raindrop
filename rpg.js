/*

- move examples to FOLDERS, with respective subdirectories?
x- (raindrop) clear background; handling layers for LIGHTING and for blank layer
- tighten up movement
  - single direction at a time
  - round TOWARDS direction of movement 
- add 'dialogue' object based on inklewriter JSON - include dialogue tree, internal variables, etc.
- add some examples - dialogue that can be exhausted, dialogue trees that can be changed from action/item/variable

- LATER: turn-based combat engine

BUG: 
  - SPACING and right-aligned spritefont (and dialoguetree)
x- solid detection/handling ("solids" grid 2d array, check before movement?)
*/

// from inklewriter JSON
var DialogueTree = Object.create(SpriteFont);
DialogueTree.init = function (sprite, data) {
  this.oldInit(sprite);
  this.tree = data.stitches;
  console.log(data);
  this.root = data.initial;
  this.text = this.tree[this.root].content[0];
  this.selected = 2;
  return this;
};
/*
additions:
 - ability to move selection
 - drawing of choices
 - check that selection exists
 - handling 'end-state'
 - handling conditions (once added), state variables
 - restarting on dialogue end

 */
DialogueTree.select = function () {
  this.root = this.tree[this.root].content[this.selected].linkPath;
  //console.log(this.root, this.tree);
  this.text = this.tree[this.root].content[0];
};


// direction, offset, tilesize, speed, rate
var TileMove = Object.create(Behavior);
TileMove.update = function (dt) {
  // check for solid
  var g = this.toGrid(this.entity.x, this.entity.y);
  if (this.grid[g.x + this.direction.x] && this.grid[g.x + this.direction.x][g.y + this.direction.y] === true) {
    this.direction = {x: 0, y: 0};
    console.log('solid!!');
  }

  // a little... slippery - will 'lerp' back to grid in one axis while moving at C in another....
  if (this.direction.x !== 0) {
    this.entity.x += this.direction.x * this.speed * dt;
  } else {
    this.entity.x = lerp(this.entity.x, Math.round((this.entity.x - this.offset.x) / this.tilesize) * this.tilesize + this.offset.x, this.rate * dt);
  } 
  if (this.direction.y !== 0) {
    this.entity.y += this.direction.y * this.speed * dt;
  } else {
    this.entity.y = lerp(this.entity.y, Math.round((this.entity.y - this.offset.y) / this.tilesize) * this.tilesize + this.offset.y, this.rate * dt);
  }
};
TileMove.toGrid = function (x, y) {
  return {x: Math.round((x - this.offset.x) / this.tilesize), y: Math.round((y - this.offset.y) / this.tilesize)};
};
TileMove.fromGrid = function (x, y) {
  return {x: this.offset.x + this.tilesize * x, y: this.offset.y + this.tilesize * y};
};
TileMove.move = function (direction) {
  this.direction = direction;
  if (this.direction.y === 1) this.entity.animation = 0;
  else if (this.direction.x === 1) this.entity.animation = 1;
  else if (this.direction.y === -1) this.entity.animation = 2;
  else if (this.direction.x === -1) this.entity.animation = 3;
};

var game = Object.create(World).init(320, 180);
game.resource_path = "";
game.gameInfo = {resources: [
  {path: "res/witch.png", frames: 3, animations: 4, speed: 0.25, name: "witch"},
  {path: "res/font.png", frames: 95, animations: 1, speed: 0.25, name: "font"},
  {path: "res/tileset.png", frames: 4, animations: 4, speed: 0.5, name: "tileset"},
  {path: "res/spirit.png", frames: 1, animations: 1, speed: 0.5, name: "spirit"},
  {path: "res/rpg.json", name: "rpg"},
  {path: "res/dialogue.json", name: "dialogue"}
]};
game.loadResources();
var scene = game.add(Object.create(Scene).init());
scene.onStart = function () {
  var bg = this.add(Object.create(Layer).init(game.w, game.h));
  var grid = [], HEIGHT = Resources.rpg.height, WIDTH = Resources.rpg.width, TILESIZE = Resources.rpg.tileheight;
  // loading tilemaps and SOLID information
  for (var i = 0; i < Resources.rpg.layers.length; i++) {
    bg.add(Object.create(TiledMap).init(Resources.tileset, Resources.rpg.layers[i])).set({x: TILESIZE * WIDTH / 2, y: TILESIZE * HEIGHT / 2, z: i});
    if (Resources.rpg.layers[i].name == "Solids") {
      for (var j = 0; j < Resources.rpg.layers[i].data.length; j++) {
        if (!grid[j % WIDTH]) grid[j % WIDTH] = [];
        if (Resources.rpg.layers[i].data[j] != 0) {
          grid[j % WIDTH][Math.floor(j / WIDTH)] = true; //fg.add(Object.create(Sprite).init(Resources.tile).set({opacity: 0, x: MIN.x + (i % 50) * GRIDSIZE, y: MIN.y + round(i / 50, 1) * GRIDSIZE, z: 4, solid: true}));
        } else {
          grid[j % WIDTH][Math.floor(j / WIDTH)] = false;
        }
      }
    }
  }
  var witch = bg.add(Object.create(Sprite).init(Resources.witch)).set({x: 4 * 15, y: 3 * 16, z: 10, offset: {x: 0, y: -10}});
  debug = witch;
  var g = bg.add(Object.create(Sprite).init(Resources.spirit)).set({x: 8 * 16 + 8, y: 4 * 16 + 8 });
  witch.move = witch.add(TileMove, {direction: {x: 0, y: 0}, offset: {x: 8, y: 8}, tilesize: 16, speed: 100, rate: 10, grid: grid});

  bg.camera.add(Follow, {target: witch, offset: {x: -game.w / 4, y: -game.h / 2}});

  var light = this.add(Object.create(Layer).init(game.w, game.h));
  light.camera.add(Follow, {target: witch, offset: {x: -game.w / 4, y: -game.h / 2}});
  light.bg = "black";
  var rings = [32, game.h / 2 - 16, game.w / 2];
  for (var i = 0; i < 2; i++) {
    var lamp = light.add(Object.create(Circle).init()).set({x: witch.x, y: witch.y, radius: rings[i], opacity: 0.5, color: 'white', blend: 'destination-out'});
    lamp.add(Follow, {target: witch, offset: {x: 0, y: 0}});
  }

  var ui = this.add(Object.create(Layer).init(game.w, game.h));
  game.dialogue = ui.add(Object.create(DialogueTree).init(Resources.font, Resources.dialogue.data)).set({x: game.w - 8, y: 16, align: "right", spacing: 0});

  this.onKeyDown = function (e) {
    switch (e.keyCode) {
      case 37:
        witch.move.move({x: -1, y: 0});
        break;
      case 39:
        witch.move.move({x: 1, y: 0});
        break;
      case 38:
        witch.move.move({x: 0, y: -1});
        break;
      case 40:
        witch.move.move({x: 0, y: 1});
        break;
      case 32:
        if (game.dialogue) game.dialogue.select();
        break;
    }
  };
  this.onKeyUp = function (e) {
    switch (e.keyCode) {
      case 37:
        witch.move.direction.x = 0;
        break;
      case 39:
        witch.move.direction.x = 0;
        break;
      case 38:
        witch.move.direction.y = 0;
        break;
      case 40:
        witch.move.direction.y = 0;
        break;
    }
  };
  this.ready = true;
};