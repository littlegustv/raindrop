// a collision object, which will set up the required data

var Collision = {
	init: function ( fns ) {
		object.onStart = fns.start || object.onStart,
		object.onCheck = fns.check || object.onCheck,
		object.onHandle = fns.handle || object.onHandle,
		object.onEnd = fns.end || object.onEnd;
	},
	onStart: function (object) {},
	onCheck: function (object, other) {},
	onHandle: function (object, object) { },
	onEnd: function (object) {},
	onDraw: function (object, ctx) {}
};

var PixelPerfect = Object.create(Collision);
PixelPerfect.onStart = function (object) {
		if (!object.getImageData) {
			object.getImageData = function () {
				if (!object.imageData) {
					var c = document.createElement("canvas");
					c.width = object.w;
					c.height = object.h;
					var ctx = c.getContext("2d");
					ctx.imageSmoothingEnabled = false;
					var x = object.x, y = object.y, opacity = object.opacity;
					object.x = object.w / 2, object.y = object.h / 2, object.opacity = 1;
					object.draw(ctx);
					object.ig = ctx.getImageData(0, 0, object.w, object.h);
					object.imageData = object.ig.data;
					object.x = x, object.y = y, object.opacity = opacity;
		   			return object.imageData;
				}
				else {
					return object.imageData;
				}
	  };
	}
};
PixelPerfect.onCheck = function (object, other) {
	// object is a weird/hacky/exciting thing... so if an entity has the 'doPixelPerfect' collision, it will check for imageData, and create and supply its own function if it isn't found.

	if (!object.getImageData || !other.getImageData) return false;
  
	var m = object, n = other;
	var n_data = n.getImageData();
	var m_data = m.getImageData();

	// if either does not have an imageData field, cannot find collision

  m = {x: m.getBoundX(), y: m.getBoundY(), w: m.w, h: m.h};
  n = {x: n.getBoundX(), y: n.getBoundY(), w: n.w, h: n.h};
	if (m.x + m.w < n.x || m.x > n.x + n.w)
		return false;
	if (m.y + m.h < n.y || m.y > n.y + n.h)
		return false;


	// find intersection...
	var minX = Math.max(m.x, n.x), minY = Math.max(m.y, n.y);
	var maxX =  Math.min(m.x + m.w, n.x + n.w), maxY = Math.min(m.y + m.h, n.y + n.h);
	
/**					************************					**/
/**					Compare in overlap range					**/
/**					(Pixel by pixel, if not 					**/
/**					transparent i.e. 255)   					**/
/**					************************					**/

	for (var j = 0; j < maxY - minY; j++)
	{
		for (var i = 0; i < maxX - minX; i++)
		{
			var my = ((minY - m.y) + j) * m.w * 4,
				mx = ((minX - m.x) + i) * 4 + 3;
			var ny = ((minY - n.y) + j) * n.w * 4,
				nx = ((minX - n.x) + i) * 4 + 3;
			if (m_data[my + mx] != 0 && n_data[ny + nx] != 0)
			{
				return true;
			}
		}
	}
	return false;
};

var Box = Object.create(Collision);
Box.onCheck = function (object, other) {
	if (object.x + object.w > other.x && object.x < other.x + other.w) {
		if (object.y + object.h > other.y && object.y < other.y + other.h) {
			return true;
		}
	}
	return false;
};

var Polygon = Object.create(Collision);
Polygon.onStart = function (object) {
	if (!object.vertices) {
		var d = Math.sqrt(Math.pow(object.w, 2) + Math.pow(object.h, 2)) / 2;
		var th = Math.acos(0.5 * object.w / d);
		object.vertices = [
			{d: d, theta: th},
			{d: d, theta: Math.PI - th},
			{d: d, theta: Math.PI + th},
			{d: d, theta: 2 * Math.PI - th}
		];
	}
	object.getVertices = function () {
		var result = [];
		for (var i = 0; i < this.vertices.length; i++) {
			var x = this.x + this.vertices[i].d * Math.cos(this.vertices[i].theta + this.angle);
			var y = this.y + this.vertices[i].d * Math.sin(this.vertices[i].theta + this.angle);
			result.push({x: x, y: y});
		}
		return result;
	}
	object.getAxes = function () {
		var result = [];
		var v = this.getVertices();
		for (var i = 0; i < v.length; i++) {
			var x = v[i].x - v[(i+1) % v.length].x;
			var y = v[i].y - v[(i+1) % v.length].y;
			var magnitude = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
			result.push({x: -y / magnitude, y: x / magnitude});
		}
		return result;
	}
};

Polygon.onCheck = function (o1, o2) {
	if (!o1.getVertices || !o2.getVertices) return false;
	else if (o1 == o2) return false;
	else if (distance(o1.x, o1.y, o2.x, o2.y) > Math.max(o1.h, o1.w) + Math.max(o2.h, o2.w)) return false;
	var v1 = o1.getVertices(), v2 = o2.getVertices();
	var a1 = o1.getAxes(), a2 = o2.getAxes();

	var separate = false;

	for (var i = 0; i < a1.length; i++) {
		var p1 = project(a1[i], v1);
		var p2 = project(a1[i], v2);

		if (!overlap(p1, p2)) return false;
	}

	for (var i = 0; i < a2.length; i++) {
		var p1 = project(a2[i], v1);
		var p2 = project(a2[i], v2);

		if (!overlap(p1, p2)) return false;
	}

	// line between center point of the two objects
	/*
	var s_a = {x: (o1.x - o2.x) , y: (o1.y - o2.y)}
	var max = 0, index = 0;

	for (var i = 0; i < v2.length; i++) {
		var p = dot(s_a, v2[i]);
		if (p > max) {
			max = p;
			index = i;
		}
	}

	var v = {x: v2[index].x - o2.x, y: v2[index].y - o2.y};

	var proj = (dot(v, s_a) / dot(s_a, s_a));
	var projection = {x: proj * s_a.x, y: proj * s_a.y};*/

	return true;//distance(0, 0, projection.x, projection.y);
}


var Collisions = {
	Box: Box
}

var HandleCollision = {
	handleSolid: function (object, other) { 
		if (other.solid) {
			var dx = Math.abs(object.x - other.x);
			var d = distance(object.x, object.y, other.x, other.y);
			var cross = distance(other.x, other.y, other.getBoundX(), other.getBoundY());
			//console.log(dx, d, 0.5 * other.w, cross);
			var bounce = (object.bounce || 0) || (other.bounce || 0);
			if (Math.abs(dx / d) < Math.abs(0.5 * other.w / cross)) {
				//console.log('vertical');
				object.y += object.getBoundY() < other.getBoundY() ? -2 : 2;
        		object.velocity.y = object.getBoundY() < other.getBoundY() ? Math.min(-1 * bounce * object.velocity.y, object.velocity.y) : Math.max(-1 * bounce * object.velocity.y, object.velocity.y);
        		object.acceleration.y = object.getBoundY() < other.getBoundY() ? Math.min(0, object.acceleration.y) : Math.max(0, object.acceleration.y);
        	} else {
        		//console.log('horizontal')
				object.x += object.getBoundX() < other.getBoundX() ? -2 : 2;
        		object.velocity.x = object.getBoundX() < other.getBoundX() ? Math.min(-1 * bounce * object.velocity.x, object.velocity.x) : Math.max(-1 * bounce * object.velocity.x, object.velocity.x);
        		object.acceleration.x = object.getBoundX() < other.getBoundX() ? Math.min(0, object.acceleration.x) : Math.max(0, object.acceleration.x);
        	}//object.velY *= -1;
		}
	}
}