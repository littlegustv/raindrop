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

var game = Object.create(World).init(320, 180, "index.json");

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
        this.targets[i].cursor.opacity = 1;
      } else {
        this.targets[i].cursor.opacity = 0;
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
  var b = target.sprite.layer.add(Object.create(SpriteFont).init(Resources.font, "burn!")).set({x: target.sprite.x, y: target.sprite.y, z: target.sprite.z + 1, angle: PI / 4});
  b.add(FadeOut, {duration: 0.2, delay: 0.3});
};
Agi.num_targets = function () { return 2; };

var Bash = Object.create(Ability);
Bash.effect = function (target) {
  target.hp -= 5;
  target.hp_text.text = target.hp + "hp";
  var b = target.sprite.layer.add(Object.create(SpriteFont).init(Resources.font, "BASH.")).set({x: target.sprite.x, y: target.sprite.y, z: target.sprite.z + 1});
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

COMBAT: 

  - visibility of enemies taking their turn (selection, action, pass to player)
    - standardize 'combat entity' creation
      - SUBOBJECTS: hp (mp?) text, status text, portrait, avatar (normal sprite), selected icon
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

var Combat = {
  init: function (data) {
    this.hp = 10;
    for (var key in data) {
      this[key] = data[key];
    }
    return this;
  },
  damage: function (n) {
    this.hp -= damage;
    this.hp_text.text = this.hp + "hp";
  }
  // add ability choose, etc.
};