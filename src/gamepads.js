var mapping = ["a", "b", "x", "y", "lb", "rb", "lt", "rt", "back", "start", "ls", "rs", "dup", "ddown", "dleft", "dright"];

var GamepadButton = {
	init: function (name, gamepad) {
  	this.active = false;
    this.duration = 0;
    this.name = name;
    this.gamepad = gamepad;
    return this;
  },
  update: function (dt) {
  	this.duration += dt;
    if (this.onUpdate) this.onUpdate(dt);
  },
  start: function () {
  	this.active = true;
    if (this.onStart) this.onStart();
  },
  end: function () {
  	this.active = false;
    this.duration = 0;
    if (this.onEnd) this.onEnd();
  }
}

var Axis = {
	init: function (name, gamepad) {
  	this.x = 0;
    this.y = 0;
    this.name = name;
    this.gamepad = gamepad;
    return this;
  },
  update: function (dt, x, y) {
  	this.x = x;
    this.y = y;
    if (this.onUpdate) this.onUpdate(dt);
  }
}

var Gamepad = {
	init: function () {
  	this.buttons = {}
    for (var i = 0; i < mapping.length; i++) {
    	this.buttons[mapping[i]] = Object.create(GamepadButton).init(mapping[i], this);   
    }
    this.aleft = Object.create(Axis).init('aleft', this);
    this.aright = Object.create(Axis).init('aright', this);
    return this;
  },
  update: function (dt) {
    if (!navigator.getGamepads) return;
  	var gp = navigator.getGamepads();
    for (var i = 0; i < gp.length; i++) {
    	var pad = gp[i];
      if (pad) {
      	for (var j = 0; j < pad.buttons.length; j++) {
        	var b = this.buttons[mapping[j]];
          if (!b) {}
        	else if (pad.buttons[j].pressed) {
          	if (b.active) b.update(dt);
            else b.start();
          } else {
          		if (b.active) b.end();
          }
        }
        this.aleft.update(dt, pad.axes[0], pad.axes[1]);
        this.aright.update(dt, pad.axes[2], pad.axes[3]);
      }
    }
  }
}

//var myGamePad = Object.create(Gamepad).init();
//https://jsfiddle.net/littlegustv/k1jb2qba/5/