var onStart = function () {
  var scene = this;
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
  var g = bg.add(Object.create(Sprite).init(Resources.plant)).set({x: 8 * 16 + 8, y: 5 * 16 + 8, offset: {x: 0, y: -16}, data: Resources.dialogue.data });
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
var onUpdate = function () {
  if (game.dialogue && !game.dialogue.alive) game.dialogue = undefined;
};