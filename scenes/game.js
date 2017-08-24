var onStart = function () {

  var fg = this.add(Object.create(Layer).init(gameWorld2.w, gameWorld2.h));
  
  var bicycle = Object.create(Sprite).init(Resources.bicycle).set({x: 100,y :100, velocity: {x: 60, y: 0}});
  bicycle.add(Velocity);
  bicycle.add(Wrap, {min: {x: 0, y: 0,}, max: {x: gameWorld2.w, y: gameWorld2.h}});
  fg.add(bicycle);
  debug = bicycle;

  var road = Object.create(TiledBackground).init(Resources.ground).set({x: gameWorld2.w / 2, y: 110, w: gameWorld2.w, h: 8});
  fg.add(road);

  this.onKeyDown = function (e) {
    gameWorld2.setScene(0);
  };

  var ll = this.add(Object.create(Layer).init(gameWorld2.w, gameWorld2.h));
  var dark = ll.add(Object.create(Entity).init()).set({x: gameWorld2.w / 2, y: gameWorld2.h / 2, w: gameWorld2.w, h: gameWorld2.h, opacity: 0.9});

  var light = ll.add(Object.create(Circle).init()).set({x: bicycle.x, y: bicycle.y, radius: 20, opacity: 0.5, color: "lightorange", blend: "destination-out"});
  light.add(Follow, {target: bicycle, offset: {x: 0, y: -8, z: 0}});

};

var onUpdate = function (dt) {
};

var onEnd = function () {
};

var onDraw = function (ctx) {
};