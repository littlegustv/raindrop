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
		// FIX ME: ctx.save/restore in place for camera, is there a better place for it?
		//ctx.save();
		for (var i = 0; i < this.layers.length; i++) {
			this.layers[i].draw(ctx);
		}
		//ctx.restore();
		//if (this.onDraw) this.onDraw(ctx);
	},
	update: function (dt) {
		// update
		this.time += dt;
		for (var i = 0; i < this.layers.length; i++) {
			this.layers[i].update(dt);
		}
		/*for (var i = 0; i < this.entities.length; i++) {
			this.entities[i].checkCollisions(i, this.entities);
		}*/
		this.onUpdate(dt);
		// clean up
		/*for (var i = 0; i < this.entities.length; i++) {
			if (!this.entities[i].alive) {
				this.entities.splice(i, 1);
			}
		}*/
	}
};