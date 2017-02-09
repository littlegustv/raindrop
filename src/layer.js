var Layer = {
  init: function (camera) {
    this.paused = 0;
    if (camera) {
      this.camera = camera;
    } else {
      this.camera = Object.create(Camera).init(0,0);
    }
    this.entities = [];
    this.canvas = document.createElement('canvas');
    this.canvas.width = gameWorld.width, this.canvas.height = gameWorld.height;
    this.ctx = this.canvas.getContext('2d');
    // is all of this neccessary?
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;
    this.ctx.imageSmoothingEnabled = false;

    this.canvas.style.imageRendering = "optimizeSpeed";
    this.canvas.style.imageRendering = "-moz-crisp-edges";
    this.canvas.style.imageRendering = "-webkit-optimize-contrast";
    this.canvas.style.imageRendering = "-o-crisp-edges";
    this.canvas.style.imageRendering = "pixelated";
    this.canvas.style.msInterpolationMode = "nearest-neighbor";
    return this;
  },
  add: function (e) {
    e.layer = this;
    this.entities.push(e);
    return e;
  },
  remove: function (e) {
    var index = this.entities.indexOf(e);
    if (e != -1) {
      this.entities.splice(index, 1);
    }
  },
  draw: function (ctx) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.camera.draw(this.ctx);

    if (this.drawOrder) {
      var entities = this.drawOrder();
    } else {
      var entities = this.entities;
    }

    for (var i = 0; i < entities.length; i++) {
      entities[i].draw(this.ctx);
    }
    this.ctx.restore();
  },
  onButton: function (x, y) {
    for (var i = 0; i < this.entities.length; i++) {
      if (this.entities[i].family == 'button') {
        var e = this.entities[i];
        if (x >= e.x - e.w/2 && x <= e.x + e.w/2 && y >= e.y - e.h/2 && y <= e.y + e.h/2) {
          return e;
        }
      }
    }
  },
  update: function (dt) {
    if (this.paused > 0) {
      this.paused -= dt;
      return;
    }
    this.camera.update(dt);
    for (var i = 0; i < this.entities.length; i++) {
      this.entities[i].update(dt);
    }
    for (var i = 0; i < this.entities.length; i++) {
      this.entities[i].checkCollisions(i, this.entities);
    }
    for (var i = 0; i < this.entities.length; i++) {
      if (!this.entities[i].alive) {
        this.entities[i].end();
        this.entities.splice(i, 1);
      }
    }
  }
};