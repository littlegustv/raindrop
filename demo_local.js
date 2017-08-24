var gameWorld = Object.create(World).init(640, 360);

var s = gameWorld.add(Object.create(Scene).init("game"));
s.onStart = function () {
  var fg = this.add(Object.create(Layer).init(gameWorld.w, gameWorld.h));

  var floor = Object.create(Entity).init().set({x: 300, y: 300, w: 600, h: 200});
  var grd = gameWorld.ctx.createLinearGradient(300, 400, 300, 200);
  grd.addColorStop(0, "#2838ff");
  grd.addColorStop(0.3, "#b536ff");
  grd.addColorStop(0.8, "#6d90ff");
  grd.addColorStop(1, "rgba(67,67,67,0)");
  floor.color = grd;
  fg.add(floor);

  for (var i = 0; i < 100; i++) {
    var e = Object.create(Entity).init().set({x: Math.random() * 600, y: Math.random() + 100 + 100, w: 10, h: 10});
    e.add(Velocity);
    e.velocity = {x: 60, y: 90};
    e.add(Wrap, {min: {x: 0, y: 0}, max: {x: 600, y: 400}});
    var t = Math.random() * 3, r = Math.random() * 2;
    e.add(Oscillate, {field: 'y', object: e.velocity, constant: 40, time: t, rate: r});
    e.add(Oscillate, {field: 'h', object: e, constant: 5, time: t, rate: r / 2, initial: 10});
    e.add(Oscillate, {field: 'w', object: e, constant: 5, time: t, rate: r / 2, initial: 10});
    e.color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",255, 1)";
  e.opacity = 0.5 + Math.random() * 0.25;
  fg.add(e);
  }

// needs this to signify when we can load things like event handlers, etc.
  this.ready = true;
};
gameWorld.setScene(0);
gameWorld.start();