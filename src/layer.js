var Layer = {
  init: function (camera) {
    this.paused = 0;
    if (camera) {
      this.camera = camera;
    } else {
      this.camera = Object.create(Camera).init(0,0);
    }
    this.entities = [];
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
    // FIX ME: ctx.save/restore in place for camera, is there a better place for it?
    ctx.save();
    this.camera.draw(ctx);
    
    if (this.drawOrder) {
      var entities = this.drawOrder();
    } else {
      var entities = this.entities;
    }

    for (var i = 0; i < entities.length; i++) {
      entities[i].draw(ctx);
      /*if (DEBUG) {
        ctx.font = "24px Visitor";
        ctx.fillText(i + ", z: " + entities[i].z, entities[i].x, entities[i].y);
      }*/
    }
    ctx.restore();
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