/*

- move examples to FOLDERS, with respective subdirectories?
- (raindrop) clear background; handling layers for LIGHTING and for blank layer
- tighten up movement
	- single direction at a time
	- round TOWARDS direction of movement 
- add 'dialogue' object based on inklewriter JSON - include dialogue tree, internal variables, etc.
- add some examples - dialogue that can be exhausted, dialogue trees that can be changed from action/item/variable

- LATER: turn-based combat engine

- solid detection/handling ("solids" grid 2d array, check before movement?)
*/

// direction, offset, tilesize, speed, rate
var TileMove = Object.create(Behavior);
TileMove.update = function (dt) {
	if (this.direction.x !== 0) {
		this.entity.x += this.direction.x * this.speed * dt;
	} else if (this.direction.y !== 0) {
		this.entity.y += this.direction.y * this.speed * dt;
	} else {
		this.entity.x = lerp(this.entity.x, Math.round((this.entity.x - this.offset.x) / this.tilesize) * this.tilesize + this.offset.x, this.rate * dt);
		this.entity.y = lerp(this.entity.y, Math.round((this.entity.y - this.offset.y) / this.tilesize) * this.tilesize + this.offset.y, this.rate * dt);
	}
}

var game = Object.create(World).init(320, 180);
game.resource_path = "";
game.gameInfo = {resources: [
  {path: "res/witch.png", frames: 3, animations: 1, speed: 0.5, name: "witch"},
  {path: "res/tileset.png", frames: 4, animations: 4, speed: 0.5, name: "tileset"},
  {path: "res/spirit.png", frames: 1, animations: 5, speed: 0.5, name: "spirit"},
  {path: "res/rpg.json", name: "rpg"}
]};
game.loadResources();
var scene = game.add(Object.create(Scene).init());
scene.onStart = function () {
  var bg = this.add(Object.create(Layer).init(game.w, game.h));
  for (var i = 0; i < Resources.rpg.layers.length; i++) {
	  bg.add(Object.create(TiledMap).init(Resources.tileset, Resources.rpg.layers[i])).set({x: 0, y: 0, z: i});
  }
  var witch = bg.add(Object.create(Sprite).init(Resources.witch)).set({x: 4 * 15, y: 3 * 16, z: 10});
  var g = bg.add(Object.create(Sprite).init(Resources.spirit)).set({x: 5 * 16, y: 4 * 16 });
  witch.move = witch.add(TileMove, {direction: {x: 0, y: 0}, offset: {x: 8, y: 8}, tilesize: 16, speed: 60, rate: 10});

  bg.camera.add(Follow, {target: witch, offset: {x: -game.w / 2, y: -game.h / 2}});

  this.onKeyDown = function (e) {
  	switch (e.keyCode) {
  		case 37:
  			witch.move.direction.x = -1;
  			break;
			case 39:
  			witch.move.direction.x = 1;
  			break;
  		case 38:
  			witch.move.direction.y = -1;
  			break;
			case 40:
  			witch.move.direction.y = 1;
  			break;
  	}
  }
  this.onKeyUp = function (e) {
  	switch (e.keyCode) {
  		case 37:
  			witch.move.direction.x = 0;
  			break;
			case 39:
  			witch.move.direction.x = 0;
  			break;
  		case 38:
  			witch.move.direction.y = 0;
  			break;
			case 40:
  			witch.move.direction.y = 0;
  			break;
  	}
  }
  this.ready = true;
};