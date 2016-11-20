var AudioContext = window.AudioContext || window.webkitAudioContext;
		
var World = {
	init: function () {
		this.height = CONFIG.height, this.width = CONFIG.width;
		this.createCanvas();
		this.createDebug();
		this.scenes = [];
		this.time = 0;
		this.speed = 1;
		this.scene = undefined;
		this.paused = false;
		this.muted = false;
//		this.loadScenes();
		this.loadGameInfo();
		return this;
	},
	step: function () {
		var t = this;
		if (this.paused) {
			window.requestAnimationFrame( function () { t.step() });
			return;
		}
		var newTime = new Date();
		var dt = this.speed * ( newTime - this.startTime ) / 1000;
		this.startTime = newTime;

		this.time += dt;
		if (this.time > 1) {
			if (CONFIG.debug) this.debug.style.display = "block";
			else this.debug.style.display = "none";
			this.time = 0;
			this.debug.innerHTML = Math.floor(1 / dt) + " fps";
		}

		this.update(dt);
		this.draw();


		window.requestAnimationFrame(function() { t.step() });
	},
	createCanvas: function () {
		this.canvas = document.createElement("canvas");
		this.canvas.height = this.height, this.canvas.width = this.width;
		document.body.appendChild(this.canvas);
		//this.canvas.fullscreenElement ();
		this.ctx = this.canvas.getContext("2d");
		
		this.ctx.mozImageSmoothingEnabled = false;
		this.ctx.webkitImageSmoothingEnabled = false;
		this.ctx.msImageSmoothingEnabled = false;
		this.ctx.imageSmoothingEnabled = false;

	},
	createDebug: function () {
		this.debug = document.createElement("div");
		this.debug.setAttribute("class", "debug");
		document.body.appendChild(this.debug);
	},
	update: function (dt) {
		debug.fps = Math.floor(100 / dt) / 100;
		if (this.scene) {
			this.scene.update(dt);
		}
	},
	draw: function () {
		this.ctx.clearRect(0, 0, this.width, this.height);
		if (this.scene) {
			this.scene.draw(this.ctx);
		}
	},
	progressBar: function () {
		var n = Math.floor((this.width - 50) / this.resourceCount);
		this.ctx.fillStyle = "black";
		this.ctx.fillRect(25 + this.resourceLoadCount * n, this.height / 2 - 12, n, 25);
		this.resourceLoadCount += 1;
		var t = this;
		if (this.resourceLoadCount >= this.resourceCount) {
			if (this.scene) {
				setTimeout( function () {
					t.beginTime();
					t.step();
				}, 100);
			} else {
				this.loadScenes();
			}
		}
	},
	beginTime: function () {
		this.startTime = new Date();
		var t = this;
		document.addEventListener("visibilitychange", function (e) { 
			/*if (document.visibilityState == "hidden") {
				//if (AudioContext) audioContext.suspend();
				//else window.muted = true;
			}
			else {
				//if (AudioContext) audioContext.resume();
				//else window.muted = false;
			}*/
			t.startTime = new Date(); 
		});
	},
	loadGameInfo: function () {
		var request = new XMLHttpRequest();
		request.open("GET", "index.json", true);
		var w = this;
		request.onload = function (data) {
			w.gameInfo = JSON.parse(request.response);
			w.loadResources();
		};
		request.send();				
	},
	loadScenes: function () {
		var sceneData = this.gameInfo.scenes;
		for (var i = 0; i < sceneData.length; i++) {
			// strip off quotation marks and .json extension
			var sceneName = sceneData[i].substring(0, sceneData[i].length - 5);
			var s = Object.create(Scene).init(sceneName);
			this.scenes.push(s);

			if (sceneName == CONFIG.startScene) {
				this.setScene(i);
				this.scene.onStart();
				this.progressBar();
			}
		}
	},
	setScene: function (n) {
		if (this.scenes[n].reload) {
			this.scenes[n] = Object.create(Scene).init(this.scenes[n].name);
		}
		this.scene = this.scenes[n];
		this.addEventListeners(this.scene);
	},
	addEventListeners: function (scene) {
		var t = this;
		var c = this.canvas;
		var canvas = this.canvas.cloneNode();
		this.canvas.parentNode.replaceChild(this.canvas, canvas);
		this.canvas = canvas;
		this.ctx = this.canvas.getContext('2d');
		
		this.ctx.mozImageSmoothingEnabled = false;
		this.ctx.webkitImageSmoothingEnabled = false;
		this.ctx.msImageSmoothingEnabled = false;
		this.ctx.imageSmoothingEnabled = false;
		
		//c.parentNode.replaceChild(this.canvas, c);
		if (scene.ready) {
			if (scene.onClick) this.canvas.addEventListener('click', scene.onClick);
			if (scene.onMouseMove) this.canvas.addEventListener('mousemove', scene.onMouseMove);
			if (scene.onMouseDown) this.canvas.addEventListener('mousedown', scene.onMouseDown);
			if (scene.onMouseUp) this.canvas.addEventListener('mouseup', scene.onMouseUp);
			if (scene.onKeyDown) document.addEventListener('keydown', scene.onKeyDown);
			if (scene.onKeyUp) document.addEventListener('keyup', scene.onKeyUp);
			if (scene.onKeyPress) document.addEventListener('keypress', scene.onKeyPress);

			if (scene.onTouchStart) this.canvas.addEventListener('touchstart', scene.onTouchStart);
			if (scene.onTouchEnd) this.canvas.addEventListener('touchend', scene.onTouchEnd);
			if (scene.onTouchCancel) this.canvas.addEventListener('touchcancel', scene.onTouchCancel);
			if (scene.onTouchMove) this.canvas.addEventListener('touchmove', scene.onTouchMove);

		} else {
			// fix me: is there maybe a more elegant way of checking whether the scene is loaded?
			setTimeout(function () { t.addEventListeners(scene), 500});
		}
	},
	initAudio: function () {
		var a = new Audio();
		this.audioType = a.canPlayType("audio/ogg");

		if (AudioContext) AudioContext.createGain = AudioContext.createGain || AudioContext.createGainNode;

		if (AudioContext) {
			this.audioContext = new AudioContext();
			this.audioContext.gn = this.audioContext.createGain();
			var t = this;
			window.addEventListener("focus", function (e) {
				if (t.audioContext.resume) t.audioContext.resume();
				t.startTime = new Date();
				t.speed = 1;
			});
			window.addEventListener("blur", function (e) {
				if (t.audioContext.suspend) t.audioContext.suspend();
				t.speed = 0;
			});
		}
	},
	/* FIX ME: loads image, sound and data assets into global Resources array -> is there a better place to do this? */
	loadResources: function () {
		if (!this.gameInfo.resources) return;
		//this.setupControls();
		this.initAudio();

		this.resourceLoadCount = 0;
		this.resourceCount = this.gameInfo.resources.length;
		this.ctx.fillStyle = "gray";
		this.ctx.fillRect(this.width / 2 - 25 * this.resourceCount + i * 50, this.height / 2 - 12, 50, 25);			
		this.ctx.fillText("loading...", this.width / 2, this.height / 2 - 50);
		var w = this;

		for (var i = 0; i < this.gameInfo.resources.length; i++ ) {
			var res = this.gameInfo.resources[i].path;
			var e = res.indexOf(".");
			var name = res.substring(0, e);
			var ext = res.substring(e, res.length);
			if (ext == ".png") {
				Resources[name] = {image: new Image(), frames: this.gameInfo.resources[i].frames || 1, speed: this.gameInfo.resources[i].speed || 1, animations: this.gameInfo.resources[i].animations || 1 };
				Resources[name].image.src = "res/" + res;
				Resources[name].image.onload = function () {
					w.progressBar();
				}
			}
			else if (ext == ".ogg") {
				this.loadOGG(res, name);
/*				Resources[name] = {sound: new Audio("res/" + res, streaming=false)};
				w.progressBar();
				Resources[name].sound.onload = function () {
					console.log("loaded sound");
				}*/
			}
			else if (ext == ".wav") {
				this.loadOGG(res, name);
			}
			else if (ext == ".js") {
				var request = new XMLHttpRequest();
				request.open("GET", "res/" + res, true);
				request.onload = function () {
					w.sceneInfo = request.response;
					w.progressBar();
				};
				request.send();
			}
		}
	},
	loadOGG: function (res, name) {
		var w = this;
		// cant play ogg, load mp3
		if (name == "soundtrack" || name == "soundtrackFast") {
			this.progressBar();
		}
		if (this.audioType.length <= 0) {
			res = res.replace("ogg", "mp3");
			//console.log("replaced?");
		}
		//console.log("NEW", res);
		if (!AudioContext) {
			Resources[name] = new Audio("res/" + res, streaming=false);
			//Resources[name].src = "res/" + res;
			w.progressBar();
			return;
		}
		var request = new XMLHttpRequest();
		request.open('GET', "res/" + res, true);
		request.responseType = 'arraybuffer';

		var w = this;
		request.onload = function() {
			w.audioContext.decodeAudioData(request.response, function(b) {
				Resources[name] = {buffer: b, play: false};
				if (name == "soundtrack" || name == "soundtrackFast") {
//					if (AudioContext && Resources.soundtrack && name == "soundtrack") w.musicLoop();
				} else {
					w.progressBar();
				}
			}, function () {console.log("ERROR with decoding audio");});
		};
		request.send();
	},
	playSound: function(sound, volume)
	{
		if (AudioContext) {
			var volume = volume || 1;
			//console.log(sound);
			var buffer = sound.buffer;
			var source = this.audioContext.createBufferSource();
			source.buffer = buffer;
			
			source.connect(this.audioContext.gn);
			//this.audioContext.gn.gain.value = volume;
			this.audioContext.gn.connect(this.audioContext.destination);
			source.start(0);
			
			return source;
		} else {
			if (window.muted) {
				return;
			}
			else {
				sound.play();
				debug = sound;
				return sound;
			}
		}
	}
};