var PI = Math.PI;
var PI2 = 2 * Math.PI;

function range(min, max) {
  var arr = [];
  for (var i = min; i < max; i++) {
    arr.push(i);
  }
  return arr;
}

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

function short_angle(a1, a2) {
  var MAX = Math.PI * 2;  
  var da = (a2 - a1) % MAX;
  return 2 * da % MAX - da;
}

function lerp_angle (a1, a2, rate) {
  return a1 + short_angle(a1, a2) * rate;
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

function between(n, min, max) {
  return n >= min && n <= max;
}

function randomColor () {
  return "#" + ("000000" + Math.floor(Math.random()*Math.pow(256,3)).toString(16)).substr(-6);
}

function randint(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function randomGray () {
  var seed = ("00" + Math.floor(Math.random() * 150 + 56).toString(16)).substr(-2);
  return "#" + seed + seed + seed;
}

function lerp (current, goal, rate) {
  if (Math.abs(goal - current) <= 1) {
    return goal;
  } else {
    return (1-rate)*current + rate*goal
  }  
}

function normalize (x, y) {
  var d = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
  return {x: x / d, y: y / d};
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

var DEBUG = false;

var KEYCODE = {
	left: 37,
  up: 38,
  right: 39,
  down: 40,
  a: 65,
  d: 68,
  s: 83,
  w: 87,
  p: 80
};

var Resources = [];
var RESOURCES = [];

var debug = {};