var onStart = function () {

  var fg_camera = Object.create(Camera).init(0, 0);

  var fg = Object.create(Layer).init(fg_camera);
  this.layers.push(fg);

  var bicycle = Object.create(Sprite).init(200, 200, Resources.bicycle);
  bicycle.addBehavior(Velocity);
  bicycle.velocity = {x: 60, y: 0};
  bicycle.addBehavior(Wrap, {min: {x: 0, y: 0,}, max: {x: 640, y: 360}});
  fg.add(bicycle);

  var road = Object.create(TiledBackground).init(CONFIG.width / 2, 220, CONFIG.width, 16, Resources.ground);
  fg.add(road);

  this.onKeyDown = function (e) {
    e.preventDefault();
    return false;
  }

};

var onUpdate = function (dt) {
};

var onEnd = function () {
};

var onDraw = function (ctx) {
};