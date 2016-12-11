var gameWorld = Object.create(World).init();

var s = Object.create(Scene).init("game");
s.onStart = function () {
  var fg_camera = Object.create(Camera).init(0, 0);
  var fg = Object.create(Layer).init(fg_camera);

  var floor = Object.create(Entity).init(300, 300, 600, 200);
  var grd = gameWorld.ctx.createLinearGradient(300, 400, 300, 200);
  grd.addColorStop(0, "#2838ff");
  grd.addColorStop(0.3, "#b536ff");
  grd.addColorStop(0.8, "#6d90ff");
  grd.addColorStop(1, "rgba(67,67,67,0)");
  floor.color = grd;
  fg.add(floor);

  for (var i = 0; i < 100; i++) {
    var e = Object.create(Entity).init(Math.random() * 600,Math.random() + 100 + 100,10,10);
    e.addBehavior(Velocity);
    e.velocity = {x: 60, y: 90};
    e.addBehavior(Wrap, {min: {x: 0, y: 0}, max: {x: 600, y: 400}});
    var t = Math.random() * 3, r = Math.random() * 2;
    e.addBehavior(Oscillate, {field: 'y', object: e.velocity, constant: 40, time: t, rate: r});
    e.addBehavior(Oscillate, {field: 'h', object: e, constant: 5, time: t, rate: r / 2, initial: 10});
    e.addBehavior(Oscillate, {field: 'w', object: e, constant: 5, time: t, rate: r / 2, initial: 10});
    e.color = "rgba(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ",255, 1)";
  e.opacity = 0.5 + Math.random() * 0.25;
  fg.add(e);
  }
 
  this.layers.push(fg);
};

gameWorld.scenes.push(s);
gameWorld.scene = s;
gameWorld.setScene(0);