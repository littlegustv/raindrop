var Behavior = {
	init: function (entity, config) {
		this.entity = entity;
		this.started = false;
		for (var c in config) {
			this[c] = config[c];
		}
		return this;
	},
	start: function () {
	},
	update: function (dt) {
	},
	end: function () {
	},
	transform: function (ctx) {
	},
	draw: function (ctx) {
	},
	drawAfter: function (ctx) {
	}
}