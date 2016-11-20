var PI = Math.PI;
var PI2 = 2 * Math.PI;

function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function angle(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

function modulo(n, p) {
  return (n % p + p) % p;
}

function dot (v1, v2) {
  return v1.x * v2.x + v1.y * v2.y;
}

function cross(v1, v2) {
  return v1.x * v2.y - v1.y * v2.x;
}

function sign (n) {
  return n >= 0 ? 1 : -1;
}

function choose (array) {
  return array[Math.floor(Math.random() * array.length)];
}

function project(axes, vertices) {
  var min = dot(axes, vertices[0]);
  var max = min;
  for (var i = 0; i < vertices.length; i++) {
    var p = dot(axes, vertices[i]);
    if (p < min) min = p;
    else if (p > max) max = p;
  }
  return [min, max];
}

function lerp (current, goal, rate) {
  return (1-rate)*current + rate*goal
}

function overlap(p1, p2) {
  if ((p1[0] >= p2[0] && p1[0] < p2[1]) || (p1[1] > p2[0] && p1[1] <= p2[1])) {
      return true;
  }
  if ((p2[0] >= p1[0] && p2[0] < p1[1]) || (p2[1] > p2[0] && p2[1] <= p1[1])) {
      return true;
  }
  else {
      return false;
  }
}

function clamp (n, min, max) {
	return Math.max(Math.min(n, max), min);
}

function distance (x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

var CONFIG = {
	height: 360,
	width: 640,
	title: "My Game",
	startScene: "game",
	debug: false
};

 var GLOBALS = {
	scale: 2,
	invulnerability: 0.3
};

var SPEED = {
	// max speeds
	ship: 160,
  projectile: 330,
  // acceleration multipliers
  acel: 600,
  decel: 0.01,
  gravity: 0.1
};

var TYPE = {
	player: 0,
  enemy: 1,
  neutral: 2,
  obstacle: 3
};

var CLASS = {
	none: 0,
	ship: 1,
  projectile: 2,
  solid: 3,
  item: 4
};

var DIRECTION = {
	right: 0,
	up: 1,
	left: 2,
	down: 3
};

var KEYCODES = {
	37: "left",
  38: "up",
  39: "right",
  40: "down",
  65: "a",
  68: "d",
  83: "s",
  87: "w",
  80: "p"
};

var Resources = [];
var RESOURCES = [];

var debug = {};