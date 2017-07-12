var onStart = function () {

  var s = this;
  this.fg = this.addLayer(Object.create(Layer).init(gameWorld2.width, gameWorld2.height));
  
  for(var i = 0; i < Resources.levels.layers.length; i++) {
    var l = this.fg.add(Object.create(TiledMap).init(12 * 16, 12 * 16, Resources.rpg, Resources.levels.layers[i]));
    l.z = i;
  }

  this.ghost = this.fg.add(Object.create(Sprite).init(40, 40, Resources.ghost));
  this.ghost.lerp = this.ghost.addBehavior(Lerp, {field: "x", goal: this.ghost.x, rate: 4, object: this.ghost, callback: function () {
    this.entity.stopped = true;
  }});
  this.ghost.stopped = true;
  this.ghost.cursor = this.ghost.addBehavior(Cursor, {angle: 0, color: "white"});
  this.ghost.addBehavior(Oscillate, {object: this.ghost.offset, field: "y", constant: 1, rate: 5, initial: 0});
  this.ghost.addBehavior(Flip);
  this.ghost.velocity = {x: 0, y: 0};
  this.ghost.setCollision(Polygon);
  this.ghost.opacity = 0.7;
  this.ghost.z = 4;
  this.ghost.collision.onHandle = function (object, other) {
    if (object.lerp.goal != object.lerp.origin) {
      object.lerp.goal = object.lerp.origin;
    }
  };
  this.fg.camera.addBehavior(Follow, {target: this.ghost, offset: {x: -gameWorld2.width / 2, y: -gameWorld2.height / 2}});

  this.onKeyDown = function (e) {
    console.log(e.keyCode);
    if (e.keyCode == KEYCODE.escape) {
      gameWorld2.setScene(1);
    }
  };

  this.onMouseMove = function (e) {
    e.x = e.x + s.fg.camera.x;
    e.y = e.y + s.fg.camera.y;
    if (Math.abs(e.y - s.ghost.y) > Math.abs(e.x - s.ghost.x)) {
      s.ghost.animation = e.y > s.ghost.y ? 2 : 1;
    } else {
      s.ghost.animation = ((s.ghost.mirrored && e.x > s.ghost.x) || (!s.ghost.mirrored && e.x < s.ghost.x)) ? 2 : 0;
    }
    s.ghost.cursor.angle = Math.round(angle(s.ghost.x, s.ghost.y, e.x, e.y) / (PI / 2)) * PI / 2;
  };
  this.onMouseDown = function (e) {
    e.x = e.x + s.fg.camera.x;
    e.y = e.y + s.fg.camera.y;
    if (s.ghost.stopped) {
      var field = Math.abs(e.y - s.ghost.y) > Math.abs(e.x - s.ghost.x) ? "y" : "x";
      s.ghost.lerp.field = field;
      s.ghost.lerp.goal = e[field] > s.ghost[field] ? s.ghost[field] + 64 : s.ghost[field] - 64;
      s.ghost.lerp.origin = s.ghost[field];
      s.ghost.stopped = false;
      s.ghost.velocity[field] = e[field] - s.ghost[field];
    }
  };

};

var onUpdate = function (dt) {
};

var onEnd = function () {
};

var onDraw = function (ctx) {
};