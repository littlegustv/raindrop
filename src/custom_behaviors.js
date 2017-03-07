// movement (x,y), size, rate
var TileMovement = Object.create(Behavior);
TileMovement.update = function (dt) {
  if (this.movement.y != 0) {
    this.entity.y += this.movement.y * this.speed * dt;
  } else {
    this.entity.y = lerp(this.entity.y, Math.round(this.entity.y / this.size) * this.size, this.rate * dt);
  }
  if (this.movement.x != 0) {
    this.entity.x += this.movement.x * this.speed * dt;
  } else {
    this.entity.x = lerp(this.entity.x, Math.round(this.entity.x / this.size) * this.size, this.rate * dt);
  }
}

var Follow = Object.create(Behavior);
Follow.update = function (dt) {  
  if (this.offset.x !== false)
    this.entity.x = this.target.x + (this.offset.x || 0);
  if (this.offset.y !== false)
    this.entity.y = this.target.y + (this.offset.y || 0);
  if (this.offset.z !== false)
    this.entity.z = this.target.z + (this.offset.z || 0);
  if (this.offset.angle !== false)
    this.entity.angle = this.target.angle + (this.offset.angle || 0);
  if (this.target.alive === false) this.entity.alive = false;
};

var Shake = Object.create(Behavior);
Shake.update = function (dt) {
  if (this.time === undefined) this.start();
  this.time += dt;
  if (!this.time || this.time > this.duration) {
    if (this.original)
    {
      this.entity.x = this.original.x, this.entity.y = this.original.y;
      this.original = undefined;
    }
    return;
  }
  else {
    this.entity.x += Math.random() * this.magnitude - this.magnitude / 2;
    this.entity.y += Math.random() * this.magnitude - this.magnitude / 2;
  }
};
Shake.start = function () {
  if (this.original) return;
  this.original = {x: this.entity.x, y: this.entity.y};
  this.time = 0;
};

var Trail = Object.create(Behavior);
Trail.update = function (dt) {
  if (!this.time) this.start();
  if (this.totalTime > this.duration) return;
  this.time += dt;
  this.totalTime += dt;
  if (this.time > this.interval) {
    this.time = 0;
    var p = this.createParticle(this.entity.x, this.entity.y - 12);
    p.z = 10;
    p.health = 0;
    p.opacity = 0.3;
    p.addBehavior(FadeOut, {duration: 1});
    this.entity.layer.add(p);
  }
};
Trail.createParticle = function (x, y) {
  return Object.create(Entity).init(x + Math.random() * 16 - 8,y + Math.random() * 16 - 8,32,32);
};
Trail.start = function () {
  this.time = 0;
  this.totalTime = 0;
  this.interval = this.interval || 0.05;
  this.duration = this.duration || 10;
};

var Flip = Object.create(Behavior);
Flip.update = function (dt) {
  if (this.entity.velocity.x > 0) {
    this.entity.mirrored = false;
  } else {
    this.entity.mirrored = true;
  }
};
Flip.transform = function (ctx) {
  if (this.entity.mirrored) ctx.scale(-1, 1);
};

var Flash = Object.create(Behavior);
Flash.update = function (dt) {
  if (!this.time) this.start();
  this.time += dt;
  if (this.time >= this.duration) {
    this.entity.removeBehavior(this);
    this.entity.blend = "normal";
  }
}
Flash.start = function () {
  this.duration = this.duration || 1;
  this.time = 0;
  this.entity.blend = "screen";
}


var Delay = Object.create(Behavior);
Delay.start = function () {
  this.time = 0;
}
Delay.update = function (dt) {
  if (this.time == undefined) this.start();

  this.time += dt;
  if (this.time > this.duration) {
    this.callback();
    this.entity.removeBehavior(this);
  }
}


var FadeOut = Object.create(Behavior);
FadeOut.start = function () {
  if (this.entity.collision) {
    this.entity.collision.onCheck = function (a, b) { console.log(2);  return false };
  }
  this.maxOpacity = this.entity.opacity;
  this.time = 0;
}

var FadeIn = Object.create(Behavior);
FadeIn.start = function () {
  if (this.entity.collision) {
    this.entity.collision.onCheck = function (a, b) { console.log(3);  return false };
  }
  this.maxOpacity = 1;
  this.time = 0;
};

//object, field, goal, rate
var Lerp = Object.create(Behavior);
Lerp.update = function (dt) {
  this.object[this.field] = lerp(this.object[this.field], this.goal, this.rate * dt);
};

FadeIn.update = function (dt) {
    if (!this.time) this.start();

    if (this.delay && this.delay > 0) {
      this.delay -= dt;
      return;
    }
    
    this.time += dt;
    if (this.time < this.duration) {
      this.entity.opacity = clamp(this.maxOpacity * (this.time) / this.duration, 0, 1);      
    }
};

FadeOut.update = function (dt) {
    if (this.time === undefined) this.start();

    if (this.delay && this.delay > 0) {
      this.delay -= dt;
      return;
    }

    this.time += dt;
    if (this.time >= this.duration && this.remove) this.entity.alive = false;
    this.entity.opacity = clamp(this.maxOpacity * (this.duration - this.time) / this.duration, 0, 1);
};
FadeOut.start = function () {
  if (this.entity.collision) {
    this.entity.collision.onCheck = function (a, b) { return false };
  }
  this.maxOpacity = this.maxOpacity || this.entity.opacity;
  this.remove = this.remove === undefined ? true : this.remove;
  this.time = 0;
  this.delay = this.delay || 0;
}

var Face = Object.create(Behavior);
Face.update = function (dt) {
  this.time = this.time || 0;
  this.time += dt;
  if (this.target) {
    this.entity.angle = angle(this.entity.x + this.entity.offset.x, this.entity.y + this.entity.offset.y, 
      this.target.x + this.target.offset.x, this.target.y + this.target.offset.y) + (this.offsetAngle || 0);
  }
}

var Oscillate = Object.create(Behavior);
Oscillate.update = function (dt) {
  if (!this.started) this.start();
  this.time += this.rate * dt;
  this.object[this.field] = this.constant * Math.sin(this.time) + this.initial;
}
Oscillate.start = function () {
  this.started = true;
  this.time = this.time || 0;
  this.constant = this.constant || 1;
  this.initial = this.initial || 0;
  this.rate = this.rate || 1;
  this.object = this.object || this.entity;
}

var Cooldown = Object.create(Behavior);
Cooldown.update = function (dt) {
  if (this.entity.cooldown === undefined) this.start;

  if (this.entity.cooldown > 0)
    this.entity.cooldown -= dt;
}
Cooldown.start = function () {
  this.entity.cooldown = 0;
}

var HighLight = Object.create(Behavior);
HighLight.start = function () {
  this.time = 0;
  this.duration = this.duration || 1;
}
HighLight.update = function (dt) {
  if (this.time == undefined) this.start();
  if (this.entity.frame == 1) {
    this.time += dt;
    if (this.time > this.duration) {
      this.time = 0;
      this.entity.frame = 0;
    }
  }
}