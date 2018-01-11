var onStart = function () {

  var s = this;
  this.fg = this.add(Object.create(Layer).init(gameWorld2.w, gameWorld2.h));
  this.solids = [];
  
  for(var i = 0; i < Resources.levels.layers.length; i++) {
    if (Resources.levels.layers[i].name == "Solids") {
      for (var j = 0; j < Resources.levels.layers[i].objects.length; j++) {
        var o = Resources.levels.layers[i].objects[j];
        var solid = this.fg.add(Object.create(Entity).init()).set({x: o.x + o.width / 2, y: o.y + o.height / 2, w: o.width, h: o.height, opacity: 0});
        solid.setCollision(Polygon);
        this.solids.push(solid);
      }
    } else {
      var l = this.fg.add(Object.create(TiledMap).init(Resources.rpg, Resources.levels.layers[i])).set({x: 12 * 16, y: 12 * 16, z: i});
    }
  }

  this.ghost = this.fg.add(Object.create(Sprite).init(Resources.ghost)).set({x: 40, y: 40, stopped: true, velocity: {x: 0, y: 0}, opacity: 0.7, z: 10});
  this.ghost.lerp = this.ghost.add(Lerp, {rate: 10, goals: {x: this.ghost.x, y: this.ghost.y}});
  this.ghost.cursor = this.ghost.add(Cursor, {angle: 0, color: "white"});
  this.ghost.add(Oscillate, {object: this.ghost.offset, field: "y", constant: 1, rate: 5, initial: 0});
  this.ghost.add(Flip);
  this.ghost.setCollision(Polygon);
  this.ghost.collision.onHandle = function (object, other) {
    if (object.lerp.goal != object.lerp.origin) {
      object.lerp.goal = object.lerp.origin;
    }
  };
  this.fg.camera.add(Follow, {target: this.ghost, offset: {x: -gameWorld2.w / 2, y: -gameWorld2.h / 2}});

  this.onKeyDown = function (e) {
    console.log(e.keyCode);
    if (e.keyCode == KEYCODE.escape) {
      gameWorld2.setScene(1);
    } else if (e.keyCode == KEYCODE.a) {
      s.ghost.animation = 0;
    } else if (e.keyCode == KEYCODE.s) {
      s.ghost.animation = 4;
    }
  };

  this.onMouseMove = function (e) {

    e.x = e.x + s.fg.camera.x;
    e.y = e.y + s.fg.camera.y;
    if (Math.abs(e.y - s.ghost.y) > Math.abs(e.x - s.ghost.x)) {
      s.ghost.animation = e.y > s.ghost.y ? 3 : 2;
    } else {
      s.ghost.animation = ((s.ghost.mirrored && e.x > s.ghost.x) || (!s.ghost.mirrored && e.x < s.ghost.x)) ? 3 : 1;
    }
    s.ghost.cursor.angle = Math.round(angle(s.ghost.x, s.ghost.y, e.x, e.y) / (PI / 2)) * PI / 2;
  };
  this.onMouseDown = function (e) {
    e.x = e.x + s.fg.camera.x;
    e.y = e.y + s.fg.camera.y;
    if (s.ghost.stopped) {
      var field = Math.abs(e.y - s.ghost.y) > Math.abs(e.x - s.ghost.x) ? "y" : "x";
      s.ghost.lerp.go({x: field === "x" ? (e.x > s.ghost.x ? s.ghost.x + 32 : s.ghost.x - 32) : s.ghost.x, y: field === "y" ? (e.y > s.ghost.y ? s.ghost.y + 32 : s.ghost.y - 32) : s.ghost.y});
    }
  };

};

var onUpdate = function (dt) {
  this.ghost.checkCollisions(0, this.solids);
};

var onEnd = function () {
};

var onDraw = function (ctx) {
};