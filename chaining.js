var game = Object.create(World).init(320, 180);
game.resource_path = "";
game.gameInfo = {resources: [
  {path: "res/bicycle.png", frames: 2, animations: 1, speed: 0.5, name: "bike"},
  {path: "res/ghost.png", frames: 2, animations: 5, speed: 0.5, name: "ghost"}
]};
game.loadResources();
var scene = game.add(Object.create(Scene).init());
scene.onStart = function () {
  var bg = this.add(Object.create(Layer).init(game.w, game.h));
  bg.add(Object.create(Sprite).init(Resources.ghost)).set({x: game.w / 2, y: game.h / 2, z: 10, animation: 1});
  bg.add(Object.create(Entity).init()).set({x: game.w / 2, y: game.h / 2, w: 100, h: 20, color: "red" });
  bg.add(Object.create(Text).init("hello")).set({x: game.w / 2, y: game.h / 2 + 10, align: "center", font: "monospace", color: "white"});
  var circle = bg.add(Object.create(Circle).init()).set({x: game.w / 2 + 50, y: game.h / 2, radius: 30, color: "white", velocity: {x: -40, y: 0}});
  circle.add(Velocity);
  circle.add(Wrap, {min: {x: game.w / 2 - 50 - circle.radius, y: 0}, max: {x: game.w / 2 + 50 + circle.radius, y: game.h}});
};