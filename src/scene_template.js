var onStart = function () {

  var fg_camera = Object.create(Camera).init(0, 0);

  var fg = Object.create(Layer).init(fg_camera);
  this.layers.push(fg);

  this.onKeyDown = function (e) {
    e.preventDefault();
    return false;
  }

};

var onUpdate = function (dt) {
};

var onEnd = function () {
};

var onDraw = function (ctx) {
};