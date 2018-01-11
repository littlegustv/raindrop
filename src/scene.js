var Scene = {
	resourceCount: 1,
	resourceLoadCount: 0,
	init: function (name) {
		this.time = 0;
		this.layers = [];
    this.name = name;
		if (name !== undefined && name.indexOf('.js') !== -1) {
			this.loadBehavior(name);
		}
		return this;
	},
	onStart: function () {},
	onUpdate: function () {},
	onEnd: function () {},
	add: function (layer) {
		this.layers.push(layer);
		return layer;
	},
	remove: function (layer) {
    if (this.layers.indexOf(layer) !== -1) {
      this.layers.splice(this.layers.indexOf(layer), 1);
    }
  },
	loadProgress: function () {
		this.resourceLoadCount += 1;
		if (this.resourceLoadCount >= this.resourceCount) {
			this.ready = true;
			//this.onStart();
		}
	},
	loadBehavior: function (script) { // console.log('warning: might be problems here in more complcaited examples...') -> adding script before document is loaded, etc.
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = "scenes/" + script;
    s.id = this.name;

    var old = document.getElementById(this.name);
    if (old) {
      old.parentElement.removeChild(old);
    }
    document.body.appendChild(s);

    // FIX ME: cross browser support
    var t = this;
    s.onload = function () {
      t.onStart = onStart;
      t.onUpdate = onUpdate;
      t.onEnd = onEnd;
      t.onDraw = onDraw;
      t.onStart();
      t.ready = true;
      //t.loadProgress();
    };
  },
	draw: function (ctx) {
    for (var i = 0; i < this.layers.length; i++) {
      if (this.layers[i].active)
      {
        this.layers[i].draw(ctx);
        ctx.drawImage(this.layers[i].canvas, 0, 0);
      }
    }
  },
	update: function (dt) {
    this.time += dt;
    for (var i = 0; i < this.layers.length; i++) {
      if (this.layers[i].active)
        this.layers[i].update(dt);
    }
    this.onUpdate(dt);
  }
};