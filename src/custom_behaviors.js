var Follow = Object.create(Behavior);
Follow.update = function (dt) {
  this.entity.x = this.target.x + (this.offset.x || 0);
  this.entity.y = this.target.y + (this.offset.y || 0);
  this.entity.z = this.target.z + (this.offset.z || 0);
  if (this.target.alive == false) this.entity.alive = false;
}

var Shake = Object.create(Behavior);
Shake.update = function (dt) {
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
}
Shake.start = function () {
  if (this.original) return;
  this.original = {x: this.entity.x, y: this.entity.y};
  this.time = 0;
}

var Trail = Object.create(Behavior);
Trail.update = function (dt) {
  if (!this.time) this.start();
  if (this.totalTime > this.duration) return;
  this.time += dt;
  this.totalTime += dt;
  if (this.time > this.interval) {
    this.time = 0;
    var p = this.createParticle(this.entity.x, this.entity.y - 12 * GLOBALS.scale);
    p.z = 10;
    p.health = 0;
    p.opacity = 0.3;
    p.addBehavior(FadeOut, {duration: 1});
    this.entity.layer.add(p);
  }
}
Trail.createParticle = function (x, y) {
  return Object.create(Entity).init(x + Math.random() * 16 - 8,y + Math.random() * 16 - 8,32,32);
}
Trail.start = function () {
  this.time = 0;
  this.totalTime = 0;
  this.interval = this.interval || 0.05;
  this.duration = this.duration || 10;
}

var SeaSpray = Object.create(Behavior);
SeaSpray.update = function (dt) {
  if (!this.spray) this.start();
}
SeaSpray.start = function () {
  if (Math.random() * 100 < 10 && Math.abs(this.entity.velocity.x) > 10) {
    this.spray = Object.create(Spray).init(this.entity.x + 1 * sign(this.entity.velocity.x), this.entity.y - 1, 16, false);
    this.spray.z = 1;
    //this.spray.addBehavior(Crop, {min: {x: 0, y: 0}, max: {x: CONFIG.width, y: CONFIG.height}});
    this.spray.addBehavior(Follow, {target: this.entity, offset: {x: 0, y: 0}});
    this.entity.layer.add(this.spray);
  }
}

var Flip = Object.create(Behavior);
Flip.update = function (dt) {
  if (this.entity.velocity.x > 0) {
    this.entity.mirrored = false;
  } else {
    this.entity.mirrored = true;
  }
}
Flip.transform = function (ctx) {
  if (this.entity.mirrored) ctx.scale(-1, 1);
}

var Die = Object.create(Behavior);
Die.update = function (dt) {
  if (this.entity.health <= 0) {
    if (!this.time) this.start();
    this.time += dt;
    if (this.time >= this.duration) this.entity.alive = false;
    this.entity.opacity = (this.duration - this.time) / this.duration;
    if (this.entity.offset) {
      this.entity.offset.y += Math.sin(this.time) * 5;
    }
    this.entity.angle += dt / 10;
  }
};
Die.start = function () {
  if (this.entity.collision) {
    this.entity.collision.onCheck = function (a, b) { return false };
  }
  this.time = 0;
  this.duration = this.duration || 2;
}

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

var DieFanfare = Object.create(Behavior);
DieFanfare.update = function (dt) {
  if (this.entity.health <= 0) {
    if (!this.time) this.start();
    this.time += dt;
    if (this.time >= this.duration) this.entity.alive = false;
    this.entity.velocity = {x: 0, y: 0};
    this.entity.opacity = 1 - (this.time / this.duration);
    if (Math.random() * 100 < 16) {
      var f = Object.create(Circle).init(this.entity.x + Math.floor(Math.random() * 24) - 12, this.entity.y + 1, Math.floor(Math.random() * 24 + 12));
      f.color = "white";
      f.family = "neutral";
      f.z = this.entity.z;
      f.addBehavior(FadeOut, {duration: Math.random() * 2 + 1});
      f.opacity = 1 - (this.time / this.duration);
      if (Math.random() > 0.5)
        gameWorld.playSound(Resources.hit);
      else
        gameWorld.playSound(Resources.cannon);
      this.entity.layer.add(f);
    }
  }
}
DieFanfare.start = function () {
  if (this.entity.collision) {
    this.entity.collision.onCheck = function (a, b) { return false };
  }
  this.time = 0;
  this.entity.z = -1;
  this.entity.cooldown = 200;
  this.duration = this.duration || 3;

  for (var i = 0; i < this.entity.layer.entities.length; i++) {
    var s = this.entity.layer.entities[i];
    if (s.climb)
      s.removeBehavior(s.climb);
    if (s.weight && s.name != "monster") {
      s.velocity.x = 0, s.velocity.y = 0;
      s.addBehavior(Oscillate, {field: "x", constant: 128, time: 0, initial: 0, object: s.velocity, rate: 3});
      s.cooldown = 200;
    } else if (s.name == "monster") {
      s.velocity.x = 0;
    }
  }
}

var FadeOut = Object.create(Behavior);
FadeOut.update = function (dt) {
    if (!this.time) this.start();
    this.time += dt;

    if (this.time >= this.duration) this.entity.alive = false;
    this.entity.opacity = clamp(this.maxOpacity * (this.duration - this.time) / this.duration, 0, 1);
};
FadeOut.start = function () {
  if (this.entity.collision) {
    this.entity.collision.onCheck = function (a, b) { console.log(2);  return false };
  }
  this.maxOpacity = this.entity.opacity;
  this.time = 0;
}

var FadeIn = Object.create(Behavior);
FadeIn.update = function (dt) {
    if (!this.time) this.start();
    this.time += dt;

    this.entity.opacity = clamp(this.maxOpacity * (this.time) / this.duration, 0, 1);
};
FadeIn.start = function () {
  if (this.entity.collision) {
    this.entity.collision.onCheck = function (a, b) { console.log(3);  return false };
  }
  this.maxOpacity = 1;
  this.time = 0;
}

var Climb = Object.create(Behavior);
Climb.update = function (dt) {
  if (this.entity.x > this.max.x && this.entity.velocity.x > 0) {
    this.entity.velocity.x *= -1;
    this.entity.x = this.max.x;
    if (this.entity.y > 116) 
      this.entity.y = this.entity.y - 32 * GLOBALS.scale / 2;
  }
  if (this.entity.x < this.min.x && this.entity.velocity.x < 0) {
    this.entity.velocity.x *= -1;
    this.entity.x = this.min.x;
    if (this.entity.y > 116)
      this.entity.y = this.entity.y - 32 * GLOBALS.scale / 2;
  }
}

var PeriodicCannon = Object.create(Behavior);
PeriodicCannon.update = function (dt) {
  if (this.time == undefined) this.start();
  this.time += dt;
  if (this.time > this.interval) {
    this.time = 0;
    var exp = Object.create(Explosion).init(this.entity.x, this.entity.y - 1, 12 * GLOBALS.scale, 40, "rgba(255,255,255,0.2)");
    //exp.offset = {x: 0, y: GLOBALS.scale * 4};
    this.entity.layer.add(exp);

    addCannon(this.entity, {x: 0, y: -SPEED.ship});

    gameWorld.playSound(Resources.cannon);
  }
}
PeriodicCannon.start = function () {
  this.time = 0;
  this.interval = this.interval || 3;
}

var Shift = Object.create(Behavior);
Shift.update = function (dt) {
  if (!this.time) this.start();
  this.time += dt;
  this.entity[this.field] += this.constant * Math.sin(this.time);
}
Shift.start = function () {
  this.time = 0;
  this.constant = this.constant || 1;
}

var Ease = Object.create(Behavior);
Ease.update = function (dt) {
  this.entity.x += 4 * dt * (this.destination.x - this.entity.x);
  this.entity.y += 4 * dt * (this.destination.y - this.entity.y);  
  if (Math.abs(this.entity.x - this.destination.x) < 1 && Math.abs(this.entity.y - this.destination.y) < 1 ) {
    this.entity.x = this.destination.x;
    this.entity.y = this.destination.y;
    this.entity.removeBehavior(this);
  }
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

var Reload = Object.create(Behavior);
Reload.drawAfter = function (ctx) {
  if (this.entity.cooldown && this.entity.maxCooldown) {
    if (this.entity.cooldown >= 0) {
      ctx.fillStyle = "black";
      ctx.fillRect(this.entity.x - this.entity.w / 2, this.entity.y - this.entity.h, this.entity.w, 4 * GLOBALS.scale);
      ctx.fillStyle = "white";
      ctx.fillRect(this.entity.x - this.entity.w / 2 + 1* GLOBALS.scale, this.entity.y - this.entity.h + 1 * GLOBALS.scale, (this.entity.w - 2 * GLOBALS.scale) * (1 - this.entity.cooldown / this.entity.maxCooldown), 4 * GLOBALS.scale - 2 * GLOBALS.scale);
    }
  }
}

var Homing = Object.create(Behavior);
Homing.update = function (dt) {
  // y is minimum SPEED / 2
  if (this.entity.y >= this.target.y) {
    var theta = angle(this.entity.x, this.entity.y, this.target.x, this.target.y);
    this.entity.angle = (this.entity.angle - theta) / 2;
    this.entity.velocity.x = Math.cos(this.entity.angle) * SPEED.ship;
    this.entity.velocity.y = (this.entity.family == "enemy" ? -1 : 1) * SPEED.ship;
  }
}
Homing.drawAfter = function (ctx) {
  if (CONFIG.debug) {
    ctx.beginPath();
    ctx.moveTo(this.entity.x, this.entity.y);
    ctx.lineTo(this.target.x, this.target.y);
    ctx.strokeStyle = "orange";
    ctx.stroke();
  }
}

var Horizon = Object.create(Behavior);
Horizon.update = function (dt) {
  if (this.entity.y < this.horizon) {
    this.entity.h -= 2 * dt;
    this.entity.w -= 2 * dt;
    this.entity.x += dt;
    this.entity.velocity.y += dt * 200;
    if (this.entity.velocity.y >= -40) {
      this.entity.z = -10;
      //add splash particle here once(?)
      this.entity.opacity -= 1 * dt;
      this.entity.collision.onCheck = function (o, p) { return false; };
    } else {
    }
    if (this.entity.opacity <= 0) {
      this.entity.alive = false;
    }
  }
}