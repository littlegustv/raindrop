// frames: [{time, state: {x, y, etc.}}], loop
var KeyFrame = Object.create(Behavior);
KeyFrame.update = function (dt) {
  if (this.time === undefined) this.time = 0;
  this.time += dt;
  for (var i = this.frames.length - 1; i >= 0; i--) {
    if (this.time >=  this.frames[i].time) {
      var frame = this.frames[i];
      var next = this.frames[i + 1];
      break;
    }
  }
  if (next) {
    var t = (this.time - frame.time) / (next.time - frame.time);
    for (var key in frame.state) {
      if (next.state[key] !== undefined) {
        this.entity[key] = EASE[this.ease](frame.state[key], next.state[key], t);
      }
    }
  } else {
    if (this.loop) this.time = 0;
    else this.entity.removeBehavior(this);
  }
};
KeyFrame.interpolate = function (start, end, t) {
  return (1 - t) * start + t * end
};

// movement (x,y), size, rate, threshold
var TileMovement = Object.create(Behavior);
TileMovement.threshold = 0;
TileMovement.update = function (dt) {
  if (this.movement.y != 0) {
    this.entity.velocity.y = this.movement.y * this.speed;
  } else {
    this.entity.velocity.y = Math.round((Math.round((this.entity.y + sign(this.entity.velocity.y) * this.threshold * this.size)/ this.size) * this.size - this.entity.y)) * (this.rate);
    if (this.entity.velocity.y == 0) this.entity.y = Math.round(Math.round(this.entity.y / this.size) * this.size);
  }
  if (this.movement.x != 0) {
    this.entity.velocity.x = this.movement.x * this.speed;
  } else {
    this.entity.velocity.x = Math.round((Math.round((this.entity.x + sign(this.entity.velocity.x) * this.threshold * this.size)/ this.size) * this.size - this.entity.x)) * (this.rate);
    if (this.entity.velocity.y == 0) this.entity.y = Math.round(Math.round(this.entity.y / this.size) * this.size);
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
};

var Periodic = Object.create(Behavior);
Periodic.update = function (dt) {
  if (this.time === undefined) this.time = 0;
  this.time += dt;

  if (this.time >= this.period) {
    this.callback();
    this.time = 0;
  }
};

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
  if (this.object === undefined) this.object = this.entity;
  if (this.stopped) return;
  var done = true;
  for (var field in this.goals) {
    if (field == "angle")
      this.object[field] = lerp_angle(this.object[field], this.goals[field], this.rate * dt);
    else
      this.object[field] = lerp(this.object[field], this.goals[field], this.rate * dt);
    if (this.object[field] != this.goals[field]) done = false;
  }
  if (done && this.callback) {
    this.stopped = true;
    this.callback();
  }
};
Lerp.go = function (goals) {
  this.stopped = false;
  this.goals = goals;
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
  if (this.func === "cos") {
    this.object[this.field] = this.constant * Math.cos(this.time) + this.initial;    
  } else {
    this.object[this.field] = this.constant * Math.sin(this.time) + this.initial;    
  }
};
Oscillate.start = function () {
  this.started = true;
  this.time = this.time || 0;
  this.constant = this.constant || 1;
  this.initial = this.initial || 0;
  this.rate = this.rate || 1;
  this.object = this.object || this.entity;
};

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


var Velocity = Object.create(Behavior);
Velocity.update = function (dt) {
  this.entity.x += dt * this.entity.velocity.x;
  this.entity.y += dt * this.entity.velocity.y;
  this.entity.angle += dt * this.entity.velocity.angle || 0;
};

var Accelerate = Object.create(Behavior);
Accelerate.update = function (dt) {
  this.entity.velocity.x += dt * this.entity.acceleration.x;
  this.entity.velocity.y += dt * this.entity.acceleration.y;
  if (this.maxSpeed) {
    this.entity.velocity.x = clamp(this.entity.velocity.x, -this.maxSpeed, this.maxSpeed);
    this.entity.velocity.y = clamp(this.entity.velocity.y, -this.maxSpeed, this.maxSpeed);
  }
};

var Animate = Object.create(Behavior);
Animate.update = function (dt) {
  if (this.paused) return;
  this.entity.frameDelay -= dt;
  if (this.entity.frameDelay <= 0) {
    this.entity.frameDelay = this.entity.maxFrameDelay;
    this.entity.frame = (this.entity.frame + 1) % this.entity.maxFrame;
    if (this.entity.frame == this.entity.maxFrame - 1 &&  this.onEnd) {
      this.onEnd();
    }
  }
};

var Fade = Object.create(Behavior);
Fade.start = function () {
  if (this.entity.active) {
    this.entity.opacity = 0;
  }
  this.entity.activate = function () {
    this.entity.opacity = 0;
    this.entity.active = true;
  }
};
Fade.update = function (dt) {
  if (this.entity.opacity < 1) {
    this.entity.opacity += dt / (this.speed ? this.speed : 1);
  }
};

var Bound = Object.create(Behavior);
Bound.update = function (dt) {
  this.entity.x = clamp(this.entity.x, this.min.x, this.max.x);
  this.entity.y = clamp(this.entity.y, this.min.y, this.max.y);
};

var DrawHitBox = Object.create(Behavior);
DrawHitBox.draw = function (ctx) {
  ctx.fillStyle = "red";
  ctx.fillRect(this.entity.x - this.entity.w / 2, this.entity.y - this.entity.h / 2, this.entity.w, this.entity.h);
}


var Pathfind = Object.create(Behavior);
Pathfind.speed = 160;
Pathfind.start = function () {
  // create grid, path
  var grid = [];
  var e = Object.create(Entity).init(this.bound.min.x + this.cell_size / 2, this.bound.min.y + this.cell_size / 2, this.cell_size, this.cell_size);
  e.family = "code";
  e.setCollision(Polygon);

  var objects = this.layer.entities.filter( function (e) { return (e.solid && e.family == "neutral"); });
  for (var i = this.bound.min.x + this.cell_size / 2; i < this.bound.max.x; i += this.cell_size) {
    e.x = Math.floor(i);
    for (var j = this.bound.min.y + this.cell_size / 2; j < this.bound.max.y; j += this.cell_size) {
      e.y = Math.floor(j);
      var distance = 1;
      var c = {x: Math.floor(i / this.cell_size), y: Math.floor(j / this.cell_size)};
      for (var k = 0; k < objects.length; k++) {
        if (e.collision.onCheck(e, objects[k])) {
          distance = 99999999;
          break;
        } else {
        }
      }
      if (grid[c.x]) {
        grid[c.x][c.y] = {x: c.x, y: c.y, cost: 999999, distance: distance};
      } else {
        grid[c.x] = [];
        grid[c.x][c.y] = {x: c.x, y: c.y, cost: 999999, distance: distance};
      }
    }
  }
  this.grid = grid;
}
Pathfind.draw = function (ctx) {
  //return;
  if (!DEBUG) return;
  if (this.grid) {
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = this.route && this.route.length > 0 ? "green" : "yellow";
    for (var i = 0; i < this.grid.length; i++) {
      for (var j = 0; j < this.grid[i].length; j++) {
        if (this.grid[i][j].distance > 1)
          ctx.fillRect(this.bound.min.x + this.cell_size * i, this.bound.min.y + this.cell_size * j, this.cell_size, this.cell_size);
      }
    }
    if (this.route) {
      ctx.fillStyle = "red";
      for (var i = 0; i < this.route.length; i++) {
        ctx.fillRect(this.route[i].x * this.cell_size, this.route[i].y * this.cell_size, this.cell_size, this.cell_size);
      }
    }
    
    if (this.goal) {
      ctx.fillRect(this.goal.x - 2, this.goal.y - 2, 4, 4);
    }

    ctx.globalAlpha = 1;
  } else {
  }
}
Pathfind.getNeighbors = function (node) {
  var x = node.x, y = node.y;
  var neighbors =[];
  var right = false, left = false;
  for (var i = x - 1; i <= x + 1; i += 1) {
    var nx = i;
    if (this.grid[nx] && this.grid[nx][y])
      neighbors.push(this.grid[nx][y]);
  }
  for (var j = y - 1; j <= y + 1; j += 1) {
    if (this.grid[x]) {
      var ny = j;
      if (this.grid[x][ny])
        neighbors.push(this.grid[x][ny]);
    }
  }
  //console.log('n', neighbors.length);
  return neighbors;
}
Pathfind.new = function (target) {
  this.target = target;
  this.route = null;
}
Pathfind.stop = function () {
  this.target = null;
  this.route = null;
}
Pathfind.a_star = function (start, goals) {
  start.cost = 0;
  var checked = [];
  var fringe = [start];
  var index = 0
  
  while (fringe.length > 0 && index < 1000) {
    index += 1;
    var f = fringe.sort( function (a, b) { return a.cost < b.cost; }).pop();
    if (goals.indexOf(f) != -1) {
      var route = [];
      //ai.searching = false;
      while (f.from) {
        route.push({x: f.x , y: f.y });
        g = f.from;
        f.from = undefined;
        f = g;
      }
      return route;
    }
    checked.push(f);
    this.getNeighbors(f).forEach( function (nw) {
      if (checked.indexOf(nw) == -1) {
        var d = f.cost + nw.distance;
        if (d < nw.cost) {
          nw.cost = d;
          nw.from = f;
          fringe.push(nw);
        }
      }
    });
  }
  console.log("not found (max fringe size reached)", index, fringe.length);
  return [];
}
Pathfind.resetCost = function () {
  if (this.grid) {
    for (var i = 0; i < this.grid.length; i++) {
      for (var j = 0; j < this.grid[i].length; j++) {
        this.grid[i][j].cost = 999999;
      }
    }
  }
}
Pathfind.update = function (dt) {
  if (!this.target) return;
  if (this.grid) {
    if (this.route && this.route.length > 0) {
      if (this.goal) {
        var theta = angle(this.entity.x, this.entity.y, this.goal.x, this.goal.y);
        // FIX ME: what is 'speed' used for??? (used to be SPEED.ship)
        var dx = 1.5 * this.speed * Math.cos(theta), dy = 1.5 * this.speed * Math.sin(theta);
        this.entity.velocity.x += 3 * dt * (dx - this.entity.velocity.x);
        this.entity.velocity.y += 3 * dt * (dy - this.entity.velocity.y);
        if (distance(this.entity.x, this.entity.y, this.goal.x, this.goal.y) < 20) {
          this.goal = undefined;
        }
/*        this.entity.velocity.x = (this.goal.x - this.entity.x);
        this.entity.velocity.y = (this.goal.y - this.entity.y);
        if (Math.abs(this.goal.x - this.entity.x) < 10 && Math.abs(this.goal.y - this.entity.y) < 10)
        {
          this.goal = undefined;
        }*/
      } else {
        var next = this.route.pop();
        if (next) {
          this.goal = {x: this.cell_size * next.x + this.cell_size / 2, y: this.cell_size * next.y + this.cell_size / 2};
        }
      }
    } else {
      var i = Math.floor(this.entity.x / this.cell_size), j = Math.floor(this.entity.y / this.cell_size);
      var ti = Math.floor(this.target.x / this.cell_size), tj = Math.floor(this.target.y / this.cell_size);
      if (this.grid[i] && this.grid[i][j] && this.grid[ti] && this.grid[ti][tj]) {
        this.resetCost();
        this.route = this.a_star(this.grid[i][j], [this.grid[ti][tj]]);
      }
    }
  }
  else {
    this.start();
  }
}

var SimpleAI = Object.create(Behavior);
SimpleAI.speed = 160;
SimpleAI.update = function (dt) {
  //console.log(this.target);
  //console.log(this.target.x, this.entity.x, (this.entity.x > this.target.x ? -1 : 1))
  // FIX ME: obviously, once the screep is wrapping, you need to factor that in too...
  this.entity.velocity = {
    x: clamp( (this.entity.x > this.target.x ? -1 : 1) * Math.abs(this.entity.x - this.target.x) / 2, - this.speed / 2, this.speed / 2),
    y: clamp( (this.entity.y > this.target.y ? -1 : 1) * Math.abs(this.entity.y - this.target.y) / 2, - this.speed / 2, this.speed / 2)
  }
  if (this.entity.health < 5) {
    this.entity.removeBehavior(this);
  }
}

var Wrap = Object.create(Behavior);
Wrap.update = function (dt) {
  if (this.entity.x > this.max.x) {
    this.entity.x = this.min.x + (this.entity.x - this.max.x);
  } else if (this.entity.x < this.min.x) {
    this.entity.x = this.max.x  - (this.min.x - this.entity.x);
  }
  if (this.entity.y > this.max.y) {
    this.entity.y = this.min.y + (this.entity.y - this.max.y);
  } else if (this.entity.y < this.min.y) {
    this.entity.y = this.max.y  - (this.min.y - this.entity.y);
  }
}

var Invulnerable = Object.create(Behavior);
Invulnerable.start = function () {
  this.entity.invulnerable = 0;
}
Invulnerable.update = function (dt) {
  if (this.entity.invulnerable === undefined) this.start();
  if (this.entity.invulnerable > 0) {
    this.entity.invulnerable -= dt;
  }
}

var Drop = Object.create(Behavior);
Drop.end = function () {
  if (this.drop) {
    var d = Object.create(this.drop);
    this.entity.layer.add(d);
  }
}

var Crop = Object.create(Behavior);
Crop.update = function (dt) {
  if (this.entity.x > this.max.x || this.entity.x < this.min.x) this.entity.alive = false;
  if (this.entity.y > this.max.y || this.entity.y < this.min.y) this.entity.alive = false;
}
