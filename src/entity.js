var Entity = {
	opacity: 1,
	angle: 0,
	alive: true,
	z: 1,
	points: 1,
	// this makes it a CLASS variable, which is maybe not a good idea, since that means unless it is initialized, adding a behavior adds it to ALL objects ofthat class
	behaviors: [],
	instance: function () {
		this.x = 0; this.y = 0;
		this.velocity = {x: 0, y: 0};
		this.offset = {x: 0, y: 0};
		this.behaviors = [];
	},
	init: function () {
		this.instance();
		this.h = 4; this.w = 4;
		return this;
	},
	set: function (key, value) {
		// single pair
		if (value !== undefined) {
			k = {};
			k[key] = value;
		} else {
			k = key;
		}
		// hash
		for (var i in k) {
			this[i] = k[i];
		}
		return this;
	},
	getBoundX: function () { return Math.floor(this.x - this.w/2); }, // deprecate
  getBoundY: function () { return Math.floor(this.y - this.h/2); }, // deprecate (used only in PixelPerfect and handleSolid)
	draw: function (ctx) {
		for (var i = 0; i < this.behaviors.length; i++) {
			this.behaviors[i].draw(ctx);
		}
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.translate(this.offset.x, this.offset.y);
		
		if (this.origin)
			ctx.translate(this.origin.x, this.origin.y);
		
		ctx.rotate(this.angle);

		if (this.origin)
			ctx.translate(-this.origin.x, -this.origin.y);
		
		if (this.scale !== undefined) {
			ctx.scale(this.scale, this.scale);
		}
		if (this.blend) {
			ctx.globalCompositeOperation = this.blend;
		} else {
			ctx.globalCompositeOperation = "normal";
		}
		for (var i = 0; i < this.behaviors.length; i++) {
			this.behaviors[i].transform(ctx);
		}
		ctx.translate(-this.x, -this.y);
		ctx.globalAlpha = this.opacity;
		this.onDraw(ctx);

		ctx.globalAlpha = 1;
		ctx.restore();
		for (var i = 0; i < this.behaviors.length; i++) {
			this.behaviors[i].drawAfter(ctx);
		}
		this.drawDebug(ctx);
	},
	drawDebug: function (ctx) {
		return;
	},
	onDraw: function (ctx) {
		ctx.fillStyle = this.color || "black";
		ctx.fillRect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
	},
	setVertices: function (vertices) {
		if (vertices) {
			this.vertices = vertices.map( function (v) {
				var _d = Math.sqrt(Math.pow(v.x, 2) + Math.pow(v.y, 2));
				var _theta = Math.atan2(v.y, v.x);
				return {d: _d, theta: _theta};
			});
		} else {
			var d = Math.sqrt(Math.pow(this.w, 2) + Math.pow(this.h, 2)) / 2;
			var th = Math.acos(0.5 * this.w / d);
			this.vertices = [
				{d: d, theta: th},
				{d: d, theta: Math.PI - th},
				{d: d, theta: Math.PI + th},
				{d: d, theta: 2 * Math.PI - th}
			];
		}
	},
	setCollision: function (collision) {  // fix me: can this be included in standard 'set' ?
		this.collision = Object.create(collision);
		this.collision.onStart(this);
		return this.collision;
	},
	add: function (name, config) {  // you can only add behaviors to entities, no?
		var b = Object.create(name).init(this, config);
		this.behaviors.push(b);
		return b;
	},
	remove: function (obj) {
		var i = this.behaviors.indexOf(obj);
		obj.end();
		this.behaviors.splice(i, 1);
		return obj; // should this chain the behavior or the entity?
	},
	removeBehavior: function (obj) {
		console.warn('removeBehavior is Depcrecated: use entity.remove() instead');
		return this.remove(obj);
	},
	start: function () { // fix me: when should this be triggered (right now it NEVER is)
		for (var i = 0; i < this.behaviors.length; i++) {
			this.behaviors[i].start();
		}
	},
	end: function () {
		for (var i = 0; i < this.behaviors.length; i++) {
			this.behaviors[i].end();
		}
	},
	checkCollisions: function (start, entities) {
		if (!this.collision) return;
		for (var i = start; i < entities.length; i++) {
			if (this == entities[i]) {}
			else {
				if (this.collision.onCheck(this, entities[i])) {
					this.collision.onHandle(this, entities[i]);
					entities[i].collision.onHandle(entities[i], this);
				}
			}
		}
	},
	update: function (dt) {
		for (var i = 0; i < this.behaviors.length; i++) {
			this.behaviors[i].update(dt);
		}
	}
};

var Circle =Object.create(Entity);
Circle.init = function() {
	this.instance();
	this.radius = 5;
	return this;
};
Circle.onDraw = function (ctx) {
	ctx.moveTo(this.x, this.y);
	ctx.beginPath();
	ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
	ctx.fillStyle = this.color;
	ctx.fill();
};

var Sprite = Object.create(Entity);
Sprite.init = function (sprite) {
	this.instance();
	this.offset = {x: 0, y: 0}; // fix me: figure out origin, offset, etc.
	if (sprite) {
		if (sprite.speed) this.add(Animate);
		this.sprite = sprite; this.sprite.w = this.sprite.image.width / this.sprite.frames;
		this.animations = sprite.animations; this.animation = 0; this.sprite.h = this.sprite.image.height / this.animations;
		this.h = this.sprite.h; this.w = this.sprite.image.width / this.sprite.frames;
		this.frame = 0; this.maxFrame = this.sprite.frames; this.frameDelay = this.sprite.speed; this.maxFrameDelay = this.sprite.speed;
	}
	return this;
};
Sprite.onDraw = function (ctx) {
	ctx.drawImage(this.sprite.image, this.frame * this.sprite.w, this.animation * this.sprite.h, this.sprite.w, this.sprite.h,
		Math.round(this.x - this.w / 2), this.y - Math.round(this.h / 2), this.w, this.h);
};
Sprite.drawDebug = function (ctx) {
	if (DEBUG) {
		ctx.strokeStyle = "red";
		if (this.getVertices) {
			var v = this.getVertices();
			ctx.beginPath();
			ctx.moveTo(v[0].x, v[0].y);
			for (var i = 1; i < v.length; i++) {
				ctx.lineTo(v[i].x, v[i].y);
			}
			ctx.closePath();
			ctx.stroke();

			var a = this.getAxes();
			ctx.strokeStyle = "green";
			ctx.beginPath();
			for (var i = 0; i < a.length; i++) {
				ctx.moveTo(this.x + a[i].x, this.y + a[i].y);
				ctx.lineTo(100 * a[i].x + this.x, 100 * a[i].y + this.y);
			}
			ctx.closePath();
			ctx.stroke();
		}
		ctx.fillStyle = "red";
		ctx.fillText(Math.floor(this.x) + ", " + Math.floor(this.y), this.x, this.y);

		ctx.beginPath();
		ctx.moveTo(this.x, this.y);
		ctx.strokeStyle = "blue";
		ctx.lineTo(this.x + 200 * Math.cos(this.angle), this.y + 200 * Math.sin(this.angle));
		ctx.stroke();
	}
};
Sprite.setFrame = function (frame) {  // cute ;)
	if (frame == "random") {
		this.frame = Math.floor(Math.random() * this.maxFrame);
	} else {
		this.frame = frame;
	}
	return this;
};

var TiledBackground = Object.create(Sprite);
TiledBackground.superInit = Sprite.init;
TiledBackground.init = function (sprite) {
	this.instance();
	if (sprite) {
		this.sprite = sprite; this.sprite.h = this.sprite.image.height; this.sprite.w = this.sprite.image.width / this.sprite.frames;
		this.h = this.sprite.image.height; this.w = this.sprite.image.width / this.sprite.frames;
		this.frame = 0; this.maxFrame = this.sprite.frames; this.frameDelay = this.sprite.speed; this.maxFrameDelay = this.sprite.speed;
	}
  this.w = 320; this.h = 32;
	return this;
};
TiledBackground.onDraw = function (ctx) {
	if (!this.pattern) {
		this.pattern = ctx.createPattern(this.sprite.image,"repeat");
  }
	ctx.fillStyle = this.pattern;
  ctx.translate((this.x - this.w / 2), (this.y - this.h / 2));
  ctx.fillRect(0, 0, this.w, this.h);
  ctx.translate(-(this.x - this.w / 2), -(this.y - this.h / 2));
};

var Camera = Object.create(Entity);
Camera.init = function (scale) {
	this.instance();
	this.scale = 1;
	return this;
};
Camera.draw = function (ctx) {
	ctx.translate(-this.x,-this.y);
  ctx.scale(this.scale, this.scale);
};

var Text = Object.create(Entity);
Text.init = function (text) {
	this.instance();
	this.text = text;
	this.size = 24;
	this.color = "black";
	this.align = "center";
	this.font = "sans-serif";
	this.weight = "300";
	return this;
};
Text.onDraw = function (ctx) {
	ctx.textAlign = this.align;
	ctx.fillStyle = this.color;
	ctx.font = this.weight + " " + this.size + "px " + this.font;
	ctx.fillText(this.text, this.x, this.y);
};

var SpriteFont = Object.create(Sprite);
SpriteFont.characters = ['!', '"', '#', '$', '%', '&', '\'', '(', ')', '*', '+', ',', '-', '.', '/', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';', '<', '=', '>', '?', '@', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '[', '\\', ']', '^', '_', '`', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',  'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '{', '|', '}', '~', 'ƒ'];
SpriteFont.oldInit = SpriteFont.init;
SpriteFont.init = function (sprite, text) {
	this.instance();
  this.oldInit(sprite);
  this.x = 70; this.y = 10; this.text = text;
  this.align = "center";
  this.spacing = 0;
  return this;
};
SpriteFont.getX = function (n) { // utility function for letter position
  if (this.align == "center") {
    return this.w * (n - this.text.length / 2) - this.spacing * this.text.length / 2;
  } else if (this.align == "left") {
    return this.w * n;
  } else if (this.align == "right") {
    return this.w * (n - this.text.length);
  }
};
SpriteFont.onDraw = function (ctx) {
  for (var i = 0; i < this.text.length; i++) {
    var c = this.characters.indexOf(this.text[i]);
    var x = this.getX(i);
    if (c != -1) {
      ctx.drawImage(this.sprite.image,
        c * this.sprite.w, 0,
        this.sprite.w, this.sprite.h,
        Math.round(this.x - this.w / 2) + x + this.spacing * i, this.y - Math.round(this.h / 2), this.w, this.h);
    }
  }
};

var TileMap = Object.create(Sprite);
TileMap.oldInit = Sprite.init;
TileMap.init = function(sprite, map) {
	this.instance();
	this.oldInit(sprite);
	this.map = map;
  this.w = this.map.length * this.sprite.w;
  this.h = this.map[0].length * this.sprite.h;
  return this;
};
TileMap.onDraw = function (ctx) {
	for (var i = 0; i < this.map.length; i++) {
		for (var j = 0; j < this.map[i].length; j++) {
				ctx.drawImage(this.sprite.image,
        this.map[i][j].x * this.sprite.w, this.map[i][j].y * this.sprite.h,
        this.sprite.w, this.sprite.h,
        Math.round(this.x - this.w / 2 + i * this.sprite.w), this.y - Math.round(this.h / 2) + j * this.sprite.h, this.sprite.w, this.sprite.h);
    }
  }
};

// from Tiled map editor
var TiledMap = Object.create(Sprite);
TiledMap.oldInit = Sprite.init;
TiledMap.init = function (sprite, data) {
	this.instance();
	this.oldInit(sprite);
	this.data = data;
	this.w = this.data.width * this.sprite.w;
	this.h = this.data.height * this.sprite.h;
	return this;
};
TiledMap.onDraw = function (ctx) {
	for (var i = 0; i < this.data.width; i++) {
		for (var j = 0; j < this.data.height; j++) {
			var d = this.data.data[i + j * this.data.width];
			if (d !== 0) {
				d = d - 1;
				ctx.drawImage(this.sprite.image, this.sprite.w * (d % this.sprite.frames), this.sprite.h * Math.floor(d / this.sprite.frames), this.sprite.w, this.sprite.h,
					Math.round(this.x - this.w / 2 + i * this.sprite.w), this.y - Math.round(this.h / 2) + j * this.sprite.h, this.sprite.w, this.sprite.h);
			}
		}
	}
};