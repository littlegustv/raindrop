var Scene = {
	resourceCount: 1,
	resourceLoadCount: 0,
	init: function (name, file) {
		this.time = 0;
		this.name = name;
		this.layers = [];
		if (file) {
			this.loadBehavior(this.name + ".js");
		}
		return this;
	},
	onStart: function () {},
	onUpdate: function () {},
	onEnd: function () {},
	addLayer: function (layer) {
		this.layers.push(layer);
		return layer;
	},
	add: function (e) {
		if (this.layers.length <= 0) console.log('this scene has no layers.');
		else {
			var layer = e.layer || this.layers[0];
			layer.add(e);
		}
		return e;
	},
	remove: function (e) {
		if (this.layers.length <= 0) console.log('this scene has no layers.');
		else {
			var layer = e.layer || this.layers[0];
			layer.remove(e);
		}
	},
	loadProgress: function () {
		this.resourceLoadCount += 1;
		if (this.resourceLoadCount >= this.resourceCount) {
			this.ready = true;
			//this.onStart();
		}
	},
	loadBehavior: function (script) {
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