/*

- movement
  - use keys hash instead of onkeydown event?

- dialogue
  - conditions and state variables
    - create inklewriter example
    - handle it
    - add ability to modify dialogue variable from external source

- turn-based combat engine
  - new scene (combat), load from global COMBAT data object
  - 'states' with buttons, controls like in game menu, salvage store, etc.
  - enemies list
  - load abilities data depending on global player info (class, level, etc.)
  - transitions!  like have bg & fg cameras lerp in/out on load/exit
  - go to second scene for stats (i.e. gained X experience, etc.)

BUG: 
*/

// from inklewriter JSON
var DialogueTree = Object.create(SpriteFont);
DialogueTree.init = function (sprite, data) {
  this.oldInit(sprite);
  this.tree = data.stitches;
  //console.log(data);
  this.root = data.initial;
  this.text = this.tree[this.root].content[0];
  this.options = this.tree[this.root].content.filter(function (o) { return o.option !== undefined; });

  this.selected = 0;
  return this;
};
DialogueTree.drawText = function (ctx, text, index) {
  for (var i = 0; i < text.length; i++) {
    var c = this.characters.indexOf(text[i]);
    var x = this.getX(i, text);
    if (c != -1) {
      ctx.drawImage(this.sprite.image,
        c * this.sprite.w, 0,
        this.sprite.w, this.sprite.h,
        Math.round(this.x - this.w / 2) + x + this.spacing * i, (index * (this.h + 2)) + this.y - Math.round(this.h / 2), this.w, this.h);
    }
  }
};
DialogueTree.getX = function (n, text) {
  if (this.align == "center") {
    return this.w * (n - text.length / 2) - this.spacing * text.length / 2;
  } else if (this.align == "left") {
    return this.w * n;
  } else if (this.align == "right") {
    return this.w * (n - text.length);
  }
};

DialogueTree.onDraw = function (ctx) {
  this.drawText(ctx, this.tree[this.root].content[0], 0);
  for (var i = 0; i < this.options.length; i++) {
    var text = this.options[i].option;
    if (i === this.selected) {
      text = "[" + text + "]";
    }    
    this.drawText(ctx, text, i + 1);
  }
};
DialogueTree.up = function () {
  this.selected = modulo((this.selected - 1), this.options.length);
};
DialogueTree.down = function () {
  this.selected = modulo((this.selected + 1), this.options.length);
};
/*
additions:
 - handling conditions (once added), state variables

 */
DialogueTree.select = function () {
  if (this.options.length <= 0) {
    this.alive = false;
    return;
  }
  this.root = this.options[this.selected].linkPath;
  this.selected = 0;
  this.options = this.tree[this.root].content.filter(function (o) { return o.option !== undefined; });
  //console.log(this.root, this.tree);
  this.text = this.tree[this.root].content[0];
};


// direction, offset, tilesize, speed, rate
var TileMove = Object.create(Behavior);
TileMove.update = function (dt) {
  var g = this.toGrid(this.entity.x, this.entity.y);
  
  // SOLID
  if (this.solid(g.x + this.direction.x, g.y + this.direction.y)) {
    this.stop(true);
    console.log('solid!!');
  } else if (this.goal) {
    this.entity.x = lerp(this.entity.x, this.goal.x, this.rate * dt);
    this.entity.y = lerp(this.entity.y, this.goal.y, this.rate * dt);
    if (this.entity.x === this.goal.x && this.entity.y === this.goal.y) this.goal = undefined;
  } else if (this.direction.x !== 0 || this.direction.y !== 0) {
    // key down, move constant
    this.entity.x += this.direction.x * this.speed * dt;
    this.entity.y += this.direction.y * this.speed * dt;
  } else if (this.buffer !== undefined) {
    this.move(this.buffer);
    this.buffer = undefined;
  }
};

TileMove.solid = function (x, y) {
  return this.grid[x] && this.grid[x][y] === true;
};
TileMove.stop = function (solid) {
  var g = this.toGrid(this.entity.x, this.entity.y);
  if (solid) {
    this.goal = this.fromGrid(g.x, g.y);
    this.direction = {x: 0, y: 0};
  } else {
    g = this.toGrid(this.entity.x + this.direction.x * this.tilesize / 4, this.entity.y + this.direction.y * this.tilesize / 4);
    if (this.solid(g.x, g.y)) {
      g = this.toGrid(this.entity.x, this.entity.y);
    }
    this.goal = this.fromGrid(g.x, g.y);
    this.direction = {x: 0, y: 0};
  }
  this.buffer = undefined;
};
TileMove.toGrid = function (x, y) {
  return {x: Math.round((x - this.offset.x) / this.tilesize), y: Math.round((y - this.offset.y) / this.tilesize)};
};
TileMove.fromGrid = function (x, y) {
  return {x: this.offset.x + this.tilesize * x, y: this.offset.y + this.tilesize * y};
};
TileMove.move = function (direction) {
  if (this.direction.x === 0 && this.direction.y === 0 && this.goal === undefined) {
    this.direction = direction;
    // this uses the following animation index convention [down (0), right (1), up (2), left (3)]
    this.entity.animation = Math.abs(this.direction.x * 2) + Math.abs(this.direction.y * 1) - this.direction.x - this.direction.y;    
  } else {
    this.buffer = direction;
  }
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
  this.talkables = [];
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
  var witch = bg.add(Object.create(Sprite).init(Resources.witch)).set({x: 8 + 8 * 16, y: 8 + 3 * 16, z: 10, offset: {x: 0, y: -10}});
  debug = witch;
  var g = bg.add(Object.create(Sprite).init(Resources.spirit)).set({x: 8 * 16 + 8, y: 4 * 16 + 8, data: Resources.dialogue.data });
  this.talkables.push(g);

  witch.move = witch.add(TileMove, {direction: {x: 0, y: 0}, offset: {x: 8, y: 8}, tilesize: 16, speed: 100, rate: 20, grid: grid});

  bg.camera.add(LerpFollow, {target: witch, offset: {x: -game.w / 4, y: -game.h / 2}, rate: 5});


  var light = this.add(Object.create(Layer).init(game.w, game.h));
  light.camera.add(Follow, {target: witch, offset: {x: -game.w / 4, y: -game.h / 2}});
  light.bg = "black";
  var rings = [32, game.h / 2 - 16, game.w / 2];
  for (var i = 0; i < 2; i++) {
    var lamp = light.add(Object.create(Circle).init()).set({x: witch.x, y: witch.y, radius: rings[i], opacity: 0.5, color: 'white', blend: 'destination-out'});
    lamp.add(Follow, {target: witch, offset: {x: 0, y: 0}});
  }

  var ui = this.add(Object.create(Layer).init(game.w, game.h));

  this.onKeyDown = function (e) {
    switch (e.keyCode) {
      case 37:
        if (game.dialogue) game.dialogue.down();
        else witch.move.move({x: -1, y: 0});
        break;
      case 39:
        if (game.dialogue) game.dialogue.up();
        else witch.move.move({x: 1, y: 0});
        break;
      case 38:
        if (game.dialogue) game.dialogue.up();
        else witch.move.move({x: 0, y: -1});
        break;
      case 40:
        if (game.dialogue) game.dialogue.down();
        else witch.move.move({x: 0, y: 1});
        break;
      case 32:
        if (game.dialogue) game.dialogue.select();
        else {
          var p = witch;
          for (var i = 0; i < scene.talkables.length; i++) {
            var g = scene.talkables[i];
            if (distance(p.x, p.y, g.x, g.y) <= 16 && modulo(angle(witch.x, witch.y, scene.talkables[i].x, scene.talkables[i].y), PI2) == witch.angle) {
              game.dialogue = ui.add(Object.create(DialogueTree).init(Resources.font, scene.talkables[i].data)).set({x: game.w - 8, y: 16, align: "right", spacing: 0});
              break;              
            }
          }
        }
        break;
      case 27:
        if (game.dialogue) game.dialogue.alive = false;
        break;
    }
  };
  this.onKeyUp = function (e) {
    switch (e.keyCode) {
      case 37:
        witch.move.stop();
        break;
      case 39:
        witch.move.stop();
        break;
      case 38:
        witch.move.stop();
        break;
      case 40:
        witch.move.stop();
        break;
    }
  };
  this.ready = true;
};
scene.onUpdate = function () {
  if (game.dialogue && !game.dialogue.alive) game.dialogue = undefined;
}