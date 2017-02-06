var onStart = function () {

  var fg = this.addLayer(Object.create(Layer).init());
  
  var bicycle = Object.create(Sprite).init(100, 100, Resources.bicycle);
  bicycle.addBehavior(Velocity);
  bicycle.velocity = {x: 60, y: 0};
  bicycle.addBehavior(Wrap, {min: {x: 0, y: 0,}, max: {x: gameWorld2.width, y: gameWorld2.height}});
  fg.add(bicycle);
  debug = bicycle;

  var road = Object.create(TiledBackground).init(gameWorld2.width / 2, 110, gameWorld2.width, 8, Resources.ground);
  fg.add(road);

  this.onKeyDown = function (e) {
    e.preventDefault();
    return false;
  };

};

var onUpdate = function (dt) {
};

var onEnd = function () {
};

var onDraw = function (ctx) {
};