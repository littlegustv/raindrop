/*

*/

var fight = {
  player: undefined,
  enemies: []
};

// from inklewriter JSON
var DialogueTree = Object.create(SpriteFont);
DialogueTree.init = function (sprite, data) {
  this.oldInit(sprite);
  this.tree = data.stitches;
  //console.log(data);
  this.root = data.initial;
  this.data = data;
  this.text = this.tree[this.root].content[0];
  console.log('data flags', data.flags);
  this.flags = data.flags || {};
  this.setOptions();
  this.setFlags();

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
  this.setOptions();
  this.setFlags();
  
  //console.log(this.root, this.tree);
  this.text = this.tree[this.root].content[0];
};
DialogueTree.setOptions = function () {
  var d = this;
  this.options = this.tree[this.root].content.filter(function (o) {
    if (o.notIfConditions !== undefined && o.notIfConditions !== null)  {
      for (var i = 0; i < o.notIfConditions.length; i++) {
        console.log('notif', o.notIfConditions[i].notIfCondition);
        if (d.flags[o.notIfConditions[i].notIfCondition] === true) return false;
      }
    }
    if (o.ifConditions !== undefined && o.ifConditions !== null)  {
      for (var i = 0; i < o.ifConditions.length; i++) {
        console.log('if', o.ifConditions[i].ifCondition);
        if (d.flags[o.ifConditions[i].ifCondition] !== true) return false;
      }
    }
    //if (o.ifCondition !== null && d.flags[o.ifCondition] !== true) return false;
    return o.option !== undefined;
  });
};
DialogueTree.setFlags = function () {
  for (var i = 0; i < this.tree[this.root].content.length; i++) {
    if (this.tree[this.root].content[i].flagName) {
      this.flags[this.tree[this.root].content[i].flagName] = true;
      console.log(this.flags);
    }
  }
  this.data.flags = this.flags;
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
    // make sure lerping never goes faster than constant speed
    this.entity.x += clamp((lerp(this.entity.x, this.goal.x, this.rate * dt) - this.entity.x), -this.speed * dt, this.speed * dt);
    this.entity.y += clamp((lerp(this.entity.y, this.goal.y, this.rate * dt) - this.entity.y), -this.speed * dt, this.speed * dt);
    if (this.entity.x === this.goal.x && this.entity.y === this.goal.y) {
      this.goal = undefined;
    }
  } else if (this.direction.x !== 0 || this.direction.y !== 0) {
    // key down, move constant
    this.entity.x += this.direction.x * this.speed * dt;
    this.entity.y += this.direction.y * this.speed * dt;
  } else if (this.buffer !== undefined) {
    // fix me: this could be improved, maybe by having internal "key" settings instead of relying on keydown events
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
    // fix me: could add settable 'threshold' for moving to next tile, right now it is at zero (single keypress moves at least to next tile)
    g = this.toGrid(this.entity.x + this.direction.x * this.tilesize / 2, this.entity.y + this.direction.y * this.tilesize / 2);
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

var ABILITIES = {
  fire: {
    name: 'fire',
    cost: 2,
    damage: {min: 1, max: 4},
    target: function (enemies, index) {
      return enemies;
    },
    act: function (targets) {
      for (var i = 0; i < targets.length; i++) {
        targets[i].hp -= randint(this.damage.min, this.damage.max);
        var f = targets[i].layer.add(Object.create(SpriteFont).init(Resources.font, "BURN!")).set({x: targets[i].x, y: targets[i].y, z: targets[i].z + 1, velocity: {x: 0, y: 20, angle: PI / 3}});
        f.add(Velocity);
        f.add(FadeOut, {duration: 0.2, delay: 0.3});
      }
    }
  },
  chop: {
    name: 'chop',
    cost: 0,
    damage: {min: 1, max: 1},
    target: function (enemies, index) {
      return [enemies[index]];
    },
    act: function (targets) {
      for (var i = 0; i < targets.length; i++) {
        targets[i].hp -= randint(this.damage.min, this.damage.max);
        var f = targets[i].layer.add(Object.create(SpriteFont).init(Resources.font, "chopchop")).set({x: targets[i].x, y: targets[i].y - 10, z: targets[i].z + 1, angle: PI / 4, velocity: {x: 0, y: 30}});
        f.add(Velocity);
        f.add(FadeOut, {duration: 0.2, delay: 0.3});        
      }
    }
  }
}

var game = Object.create(World).init(320, 180);
game.resource_path = "";
game.gameInfo = {resources: [
  {path: "res/cat.png", frames: 1, animations: 1, speed: 0.25, name: "cat"},
  {path: "res/witch.png", frames: 3, animations: 4, speed: 0.25, name: "witch"},
  {path: "res/demon.png", frames: 2, animations: 1, speed: 0.25, name: "demon"},
  {path: "res/bug.png", frames: 2, animations: 1, speed: 0.25, name: "bug"},
  {path: "res/menu.png", frames: 1, animations: 1, speed: 0.25, name: "menu"},
  {path: "res/font.png", frames: 95, animations: 1, speed: 0.25, name: "font"},
  {path: "res/tileset.png", frames: 4, animations: 4, speed: 0.5, name: "tileset"},
  {path: "res/spirit.png", frames: 1, animations: 1, speed: 0.5, name: "spirit"},
  {path: "res/rpg.json", name: "rpg"},
  {path: "res/dialogue.json", name: "dialogue"}
]};
game.loadResources(); // raindrop --> improve
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

  witch.hp = 10;
  witch.abilities = [
    ABILITIES.fire, ABILITIES.chop
  ];
  // set talkable coordinates to solid
  var gcoord = witch.move.toGrid(g.x, g.y);
  witch.move.grid[gcoord.x][gcoord.y] = true;

  cat = bg.add(Object.create(Sprite).init(Resources.cat)).set({x: witch.x + 2 * 16, y: witch.y, z: 9});
  cat.add(Behavior, {update: function (dt) {
    var w = witch.move.toGrid(witch.x, witch.y);
    var h = witch.move.toGrid(this.entity.x, this.entity.y);
    if (w.x === h.x && w.y === h.y) {
      if (g.data.flags === undefined) g.data.flags = {};
      g.data.flags.found = true;
      this.entity.alive = false;
    }
  }});

  bg.camera.add(LerpFollow, {target: witch, offset: {x: -game.w / 4, y: -game.h / 2}, rate: 5});


  var light = this.add(Object.create(Layer).init(game.w, game.h));
  light.camera.add(Follow, {target: witch, offset: {x: -game.w / 4, y: -game.h / 2}});
  light.bg = "black";
  var rings = [32, game.h / 2 - 16, game.w / 2];
  for (var i = 0; i < 1; i++) {
    var lamp = light.add(Object.create(Circle).init()).set({x: witch.x, y: witch.y, radius: rings[i], opacity: 1, color: 'white', blend: 'destination-out'});
    lamp.add(Follow, {target: witch, offset: {x: 0, y: 0}});
    // spotlight effect
    lamp.add(Behavior, {draw: function (ctx) {
      ctx.moveTo(game.w / 2, -game.h);
      ctx.beginPath();
      ctx.globalAlpha = 0.5;
      ctx.globalCompositeOperation = this.entity.blend;
      ctx.fillStyle = "white";
      ctx.lineTo(this.entity.x - this.entity.radius, this.entity.y);
      ctx.lineTo(this.entity.x + this.entity.radius, this.entity.y);
      ctx.lineTo(game.w / 2, -game.h);
      ctx.fill();
    }});
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
            var g = witch.move.toGrid(scene.talkables[i].x, scene.talkables[i].y);
            var w = witch.move.toGrid(witch.x, witch.y);
            if (Math.abs(g.x - w.x) + Math.abs(g.y - w.y) === 1 &&
              // check if the animation, which goes 0 (3 * PI / 2), 1 (0), 2 (PI / 2), 3 (PI) matches facing angle - i.e. are we 'looking' at the talkable object
              witch.animation === modulo(3 - round(modulo(angle(game.scene.talkables[i].x, game.scene.talkables[i].y, witch.x, witch.y), PI2) / (PI / 2), 1), 4)) {
              game.dialogue = ui.add(Object.create(DialogueTree).init(Resources.font, scene.talkables[i].data)).set({x: game.w - 8, y: 16, align: "right", spacing: 0});
              break;
            }
          }
        }
        break;
      case 27:
        if (game.dialogue) game.dialogue.alive = false;
        else {
          fight.player = witch;
          fight.enemies = [];
          for (var i = 0; i < 3; i++) {
            fight.enemies.push({sprite: Resources[choose(["bug", "spirit", "demon"])]});
          }
          game.setScene(1, false);
          game.scene.layers = [];
          game.scene.onStart();
        }
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
  this.ready = true; // raindrop --> IMPROVE
};
scene.onUpdate = function () {
  if (game.dialogue && !game.dialogue.alive) game.dialogue = undefined;
};

var Menu = Object.create(DialogueTree);
Menu.init = function (font, data) {
  this.title = "MENU";
  this.oldInit(font);
  this.root = data;
  this.current = data;
  this.path = [];
  this.reset_selection();
  return this;
};
Menu.reset_selection = function () {
  this.keys = Object.keys(this.current);
  this.selected = 0;
};
Menu.down = function () {
  if (this.current[this.keys[this.selected]]) {
    if (typeof this.current[this.keys[this.selected]] === "function") {
      return this.current[this.keys[this.selected]]();
    } else {
      this.path.push(this.current);
      this.current = this.current[this.keys[this.selected]];
    }
  }
  this.reset_selection();
  // return?
};
Menu.up = function () {
  if (this.path.length >= 1) {
    this.current = this.path.pop();
  } else {
    console.log('At root.');
  }
  this.reset_selection();
};
Menu.next = function () {
  this.selected = modulo(this.selected + 1, this.keys.length);
};
Menu.previous = function () {
  this.selected = modulo(this.selected - 1, this.keys.length);
};
Menu.selectDisplay = function (text) {
  return "[" + text + "]";
};
/*Menu.selectDisplay = function (text) {
  return text.toUpperCase();
};*/
// override this, or keep drawing separate?
Menu.onDraw = function (ctx) {
  //this.drawText(ctx, this.title, 0);
  var i = 0;
  for (var key in this.current) {
    if (key == "title") {}
    else if (key == this.keys[this.selected]) {
      this.drawText(ctx, this.selectDisplay(key), i);
    } else {
      this.drawText(ctx, key, i);
    }
    i += 1;
  }
};

var Targeting = {
  init: function (targets, n) {
    this.targets = targets;
    this.selected = Array(n).fill(1).map(function (i, index) { return index; });
    this.reset_selection();
    return this;
  },
  reset_selection: function () {
    for (var i = 0; i < this.targets.length; i++) {
      if (this.selected.indexOf(i) !== -1) {
        this.targets[i].opacity = 1;
      } else {
        this.targets[i].opacity = 0.5;
      }
    }
  },
  next: function () {
    if (this.selected.length >= this.targets.length) return;
    for (var i = 0; i < this.selected.length; i++) {
      this.selected[i] = modulo(this.selected[i] + 1, this.targets.length);
    }
    this.reset_selection();
  },
  previous: function () {
    if (this.selected.length >= this.targets.length) return;
    for (var i = 0; i < this.selected.length; i++) {
      this.selected[i] = modulo(this.selected[i] - 1, this.targets.length);
    }
    this.reset_selection();
  },
  confirm: function () {
    var confirmed = [];
    for (var i = 0; i < this.selected.length; i++) {
      confirmed.push(this.targets[this.selected[i]]);
    }
    return confirmed;
  }
};

var Ability = {
  init: function (targets) {
    this.targeting = Object.create(Targeting).init(targets, this.num_targets());
    return this;
  },
  num_targets: function () { return 1; },
  target: function () {
    this.targets = this.targeting.confirm();
  },
  act: function () {
    for (var i = 0; i < this.targets.length; i++) {
      this.effect(this.targets[i]);
    }
  },
  effect: function (target) {
    target.opacity = 0.1;
  }
};

var Agi = Object.create(Ability);
Agi.effect = function (target) {
  target.hp -= 2;
  target.hp_text.text = target.hp + "hp";
  var b = target.layer.add(Object.create(SpriteFont).init(Resources.font, "burn!")).set({x: target.x, y: target.y, z: target.z + 1, angle: PI / 4});
  b.add(FadeOut, {duration: 0.2, delay: 0.3});
};
Agi.num_targets = function () { return 2; };

var Bash = Object.create(Ability);
Bash.effect = function (target) {
  target.hp -= 5;
  target.hp_text.text = target.hp + "hp";
  var b = target.layer.add(Object.create(SpriteFont).init(Resources.font, "BASH.")).set({x: target.x, y: target.y, z: target.z + 1});
  b.add(FadeOut, {duration: 0.2, delay: 0.3});
};


// should this by a PLAYER.combat_menu? wait- this is DATA, we need a HANDLER
var combat_menu = {
  Skills: {
    Agi: function () { return Agi; },
    Bash: function () { return Bash; },
  },
  Inventory: {
    Consumables: {
      Potions: {
        Health: function () {},
        Mana: function () {}
      }
    }
  },
  "Flee!": {
    Yes: function () { game.setScene(0, false); },
    No: function () { /* move up in menu somehow ... */ }
  }
};



/*

FIRST: move to scene file structure???

COMBAT ENGINE (turn based)
x- take turns (enemy has moves as well)
x- use single controls for targeting/selecting (state variable)
- actions/menu tightening
  x- MENU structure, with commands, open/close and selection handling (i.e. I open 'skills', close it go to items, etc. - and it's all handled, preferably by a JS object structure)
  x- targeting of enemies, and visuals: targeting any N number of enemies, or ALL of them, depending on the skill (and SHOW it too)
  x- abilities that can do damage, that sort of thing??
  
  - separate SPRITES from combat objects
    - player, enemies = {hp: 10, mana: 10, vuln: 'fire', resist: 'ice', sprite: SPRITE OBJECT HERE }, etc.
    - also has functions like damage() for 'taking damage'
  
  - visibility of enemies taking their turn (selection, action, pass to player)
  - add MANA (cost), conditions (wind-up), and items (through menu)
  - overworld COMBAT triggering (collision, or grid-based simplification)

- SIMPLE vuln-based spell system
  - fire > ice > acid > lightning > poison >
  - steal KNOCKDOWN from persona (status effect)

- LONG TERM - gameplay ideas
  - should just be move-based (no spatial tactics or anything)
  - interesting things to steal from PERSONA
    - 'block 1 ability' skill, forces player to throw away 'low card' skill
    - 'reflect' - also have to consider what YOU are resistent/vulnerable to
    - interplay: attack (RELFECT) enemy with an ability that you HEALS you; dispels their protection, & heals you!
  - NEW ideas
    - way to prevent spamming buff/debuff battle
    - chaining - like building a straight in bridge or something - you get a bonus from landing spells in a certain order (i.e. Agidyne gets a bonus when following Agi)
    - base off of poker hands (i.e. two Agi in a row [turn] - 'a pair' - a small bonus!); but HIDE the poker origins, because that's overdone and confusing ;)

BUG: 

 */

var combat = game.add(Object.create(Scene).init());
combat.onStart = function () {
  this.cursor = 0;
  this.selected = undefined;
  this.targeted = undefined;
  this.bg = this.add(Object.create(Layer).init(game.w, game.h));
  this.bg.add(Object.create(Sprite).init(Resources.menu)).set({x: game.w / 2, y: game.h / 2, opacity: 0.5});
  this.bg.add(Object.create(SpriteFont).init(Resources.font, "combat")).set({x: game.w / 2, y: 16});

  this.player = this.bg.add(Object.create(Sprite).init(fight.player.sprite)).set({x: game.w / 3, y: game.h - 24, animation: 1, z: 1});
  this.player_hp = this.bg.add(Object.create(SpriteFont).init(Resources.font, fight.player.hp + "hp")).set({x: this.player.x, y: this.player.y - 12, align: "left"});

  this.enemies = [];
  for (var i = 0; i < fight.enemies.length; i++) {
    var e = this.bg.add(Object.create(Sprite).init(fight.enemies[i].sprite)).set({x: game.w - 120 + (i * i) * 9, y: game.h / 2 + i * 32, scale: 1 + Math.random() * 0.4, hp: 10, opacity: 0.5});
    e.hp_text = this.bg.add(Object.create(SpriteFont).init(Resources.font, "10hp")).set({x: e.x, y: e.y - 12 });
    e.choose = function () { return choose(this.abilities); };
    e.abilities = [
      ABILITIES.chop
    ]
    this.enemies.push(e);
  }
  this.enemies[this.cursor].opacity = 1;

  this.hp = fight.player.hp;
  
  /*this.abilities = [];
  
  for (var i = 0; i < fight.player.abilities.length; i++) {
    this.abilities.push(this.bg.add(Object.create(SpriteFont).init(Resources.font, fight.player.abilities[i].name)).set({x: 16, y: game.h / 4 + i * 16, align: "left", opacity: 0.5}));    
  }
  this.abilities[this.cursor].opacity = 1;*/

  this.ability_menu = this.bg.add(Object.create(Menu).init(Resources.font, combat_menu)).set({x: game.w / 8, y: game.h / 2, align: "left", spacing: 0});

  this.turn = 0;
  this.status = function () {
    for (var i = this.enemies.length - 1; i >= 0; i--) {
      this.enemies[i].hp_text.text = this.enemies[i].hp + "hp";
      console.log(this.enemies[i].hp, 'status');
      if (this.enemies[i].hp <= 0) {
        this.enemies[i].alive = false;
        this.enemies.splice(i, 1);
      }
    }
    this.player_hp.text = fight.player.hp + "hp";
    if (this.enemies.length <= 0) {
      game.setScene(0, false);
    } else if (fight.player.hp <= 0) {
      game.setScene(2, false);
      game.scene.layers = [];
      game.scene.onStart();
    }
    this.turn = modulo(this.turn + 1, this.enemies.length + 1);
    this.cooldown = 0.5;
  };
  this.cooldown = 0;

  this.onKeyDown = function (e) {
    if (combat.turn === 0) {
      switch (e.keyCode) {
        case 38:
          if (this.ability) {
            if (!this.ability.targets) {
              this.ability.targeting.previous();
            }
          } else {
            this.ability_menu.previous();
          }
          break;
        case 40:
          if (this.ability) {
            if (!this.ability.targets) {
              this.ability.targeting.next();              
            }
          } else {
            this.ability_menu.next();
          }
          break;
        case 32:
          if (this.ability) {
            if (!this.ability.targets) {
              this.ability.target();
            } else {
              this.ability.act();
              this.ability = undefined;
            }
          } else {
            var a = this.ability_menu.down();
            if (a) {
              this.ability = Object.create(a).init(combat.enemies);
            }
          }
          /*  combat.targeted = combat.cursor;
            targets = fight.player.abilities[   combat.selected].target(combat.enemies, combat.targeted);
            fight.player.abilities[combat.selected].act(targets);
            combat.status();
            this.selected = undefined;
            this.targeted = undefined;
            this.cursor = 0;   */         
          break;
        case 27:
          if (this.ability) {
            if (this.ability.targets) {
              this.ability.targets = undefined;
            } else {
              this.ability = undefined;
            } 
          } else {
            this.ability_menu.up();            
          }
          //game.setScene(0, false);
          break;
      }
    }
  };
  this.ready = true; // raindrop --> SOMETHING ELSE
};

combat.onUpdate = function (dt) {
  if (this.cooldown > 0) {
    this.cooldown -= dt;
    return;
  } else if (this.turn !== 0) {
    this.enemies[this.turn - 1].abilities[0].act([fight.player]);
    this.status();
    this.cooldown = 1;
  }
}

var gameover = game.add(Object.create(Scene).init());
gameover.onStart = function () {
  this.bg = this.add(Object.create(Layer).init(game.w, game.h));
  this.bg.add(Object.create(SpriteFont).init(Resources.font, "game over.")).set({x: game.w / 2, y: game.h / 2});
  this.onKeyDown = function (e) {
    game.setScene(0, false);
  }
  this.ready = true;
};

//DEBUG = true;