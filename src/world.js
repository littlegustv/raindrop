var AudioContext = window.AudioContext || window.webkitAudioContext;

// creates window
var World = {
  events: ["onClick", "onMouseMove", "onMouseDown", "onMouseUp", "onKeyDown", "onKeyUp", "onKeyPress", "onTouchStart", "onTouchEnd", "onTouchCancel", "onTouchMove"],
  init: function (w, h, gameinfo) {
    this.h = h; this.w = w;
    var t = this;
    this.scenes = [];
    this.time = 0;
    this.speed = 1;
    this.scene = undefined;
    this.paused = false;
    this.muted = false;
    this.resource_path = "res/";
    // does this work for JSFIDDLE?  I don't think it does!
    t.createCanvas();
    t.createDebug();
    if (gameinfo) {
      t.loadGameInfo(gameinfo);
    }
    return this;
  },
  add: function (scene) {
    this.scenes.push(scene);
    return scene;
  },
  start: function () {
    this.beginTime();
    this.step();

    if (document && document.body) {
      document.body.appendChild(this.canvas);
      document.body.appendChild(this.debug);
      this.scene.onStart();
    } else {
      var t = this;
      window.addEventListener('DOMContentLoaded', function (e) {
        document.body.appendChild(t.canvas);
        document.body.appendChild(t.debug);
        t.scene.onStart();
      });
    }
  },
  step: function () {
    var t = this;
    if (this.paused) {
      window.requestAnimationFrame( function () { t.step(); });
      return;
    }
    var newTime = new Date();
    var dt = this.speed * ( newTime - this.startTime ) / 1000;
    this.startTime = newTime;

    this.time += dt;
    if (this.time > 1) {
      if (DEBUG) this.debug.style.display = "block";
      else this.debug.style.display = "none";
      this.time = 0;
      this.debug.innerHTML = Math.floor(1 / dt) + " fps";
    }

    this.update(dt);
    this.draw();

    window.requestAnimationFrame(function() { t.step() });
  },
  resizeCanvas: function () {
    this.canvas.style.width = "", this.canvas.style.height = "";
    var ratio = this.canvas.width / this.canvas.height;
    // wider
    if (window.innerWidth / window.innerHeight > ratio)
    {
      this.canvas.style.height = window.innerHeight + "px";
      scale = window.innerHeight / this.canvas.height;
    } else {
      this.canvas.style.width = window.innerWidth + "px";
      scale = window.innerWidth / this.canvas.width;
    }
    this.scale = scale;
  },
  filterEvent: function (event) {
    var w = this;
    return {
      x: event.offsetX / this.scale, 
      y: event.offsetY / this.scale, 
      keyCode: event.keyCode, 
      touch: event.changedTouches && event.changedTouches.length > 0 ? {x: event.changedTouches[0].pageX / w.scale, y: event.changedTouches[0].pageY / w.scale} : {}
    };
  },
  createCanvas: function () {
    this.canvas = document.createElement("canvas");
    this.canvas.height = this.h, this.canvas.width = this.w;
    if (this.gameInfo && this.gameInfo.scale) {
      this.canvas.style.height = this.gameInfo.scale * this.h + "px";
      this.canvas.style.width = this.gameInfo.scale * this.w + "px";
    }
    //this.canvas.fullscreenElement ();
    this.ctx = this.canvas.getContext("2d");
    
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;
    this.ctx.imageSmoothingEnabled = false;

    this.canvas.style.imageRendering = "optimizeSpeed";
    this.canvas.style.imageRendering = "-moz-crisp-edges";
    this.canvas.style.imageRendering = "-webkit-optimize-contrast";
    this.canvas.style.imageRendering = "-o-crisp-edges";
    this.canvas.style.imageRendering = "pixelated";
    this.canvas.style.msInterpolationMode = "nearest-neighbor";
    this.resizeCanvas();
    var w = this;
		window.addEventListener('resize', function () { 
			w.resizeCanvas(); 
		});
  },
  createDebug: function () {
    this.debug = document.createElement("div");
    this.debug.setAttribute("class", "debug");
  },
  update: function (dt) {
    debug.fps = Math.floor(100 / dt) / 100;
    if (this.scene) {
      this.scene.update(dt);
    }
  },
  draw: function () {
    // it is up to the individual scenes to 'clear' or not
    if (this.scene) {
      this.scene.draw(this.ctx);
    }
  },
  progressBar: function () {
    var n = Math.floor((this.w - 50) / this.resourceCount);
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(25 + this.resourceLoadCount * n, this.height / 2 - 12, n, 25);
    this.resourceLoadCount += 1;
    var t = this;
    if (this.resourceLoadCount >= this.resourceCount) {
      if (document && document.body) this.loadScenes();
      else {
        window.addEventListener('DOMContentLoaded', function (e) {
          t.loadScenes();
        });
      }
    }
  },
  beginTime: function () {
    this.startTime = new Date();
    var t = this;
    document.addEventListener("visibilitychange", function (e) { 
      t.startTime = new Date(); 
    });
  },
  loadGameInfo: function (gameinfo) {
    var request = new XMLHttpRequest();
    request.open("GET", gameinfo, true);
    var w = this;
    request.onload = function (data) {
      w.gameInfo = JSON.parse(request.response);
      w.createCanvas();
      w.createDebug(); 
      w.loadResources();
    };
    request.send();        
  },
  loadScenes: function () {
    // scene data is just the name of the scenes, which implies their script file name
    var sceneData = this.gameInfo.scenes;
    if (!sceneData) {} else {
      for (var i = 0; i < sceneData.length; i++) {
        var sceneName = sceneData[i].name;
        var s = Object.create(Scene).init(sceneName, true);
        s.reload = sceneData[i].reload || false;
        this.scenes.push(s);
      }      
    }
    this.setScene(0);
    this.start();
  },
  setScene: function (n, reload) {
    if (this.scenes[n].reload || reload === true) {
      console.log('reloading, supposedly');
      this.scenes[n] = Object.create(Scene).init(this.scenes[n].name, true);
    }
    this.removeEventListeners(this.scene);
    this.scene = this.scenes[n];
    this.addEventListeners(this.scene);
    return this.scene;
  },
  removeEventListeners: function (scene) {
    if (scene && scene.ready) {
      for (var i = 0; i < this.events.length; i++) {
        var event = this.events[i];
        if (this[event]) {
          if (event.substr(0,5) == "onKey") {
            document.removeEventListener(event.toLowerCase().substr(2,event.length - 2), this[event]);
          } else {            
            this.canvas.removeEventListener(event.toLowerCase().substr(2,event.length - 2), this[event]);
          } 
        }
      }
    }
  },
  addEventListeners: function (scene) {
    var w = this;
    if (scene.ready) {
      for (var i = 0; i < this.events.length; i++) {
      // interesting : to create a unique var scope, wrap this in a function - a closure, perhaps?
        (function () {
        var event = w.events[i];
        if (scene[event]) {
          //w[event] = scene[event];
          w[event] = function (e) {
            e.preventDefault();
            scene[event](w.filterEvent(e));
            return false;
          };
          if (event.substr(0,5) == "onKey") {
            document.addEventListener(event.toLowerCase().substr(2,event.length - 2), w[event]);
          } else {            
            w.canvas.addEventListener(event.toLowerCase().substr(2,event.length - 2), w[event]);
          }
        }
        })();
      }
    } else {
      var t = this;
      // fix me: is there maybe a more elegant way of checking whether the scene is loaded?
      setTimeout(function () { t.addEventListeners(scene); }, 10);
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
        if (t.audioContext && t.audioContext.resume && !this.muted) t.audioContext.resume();
        t.startTime = new Date();
        t.speed = 1;
      });
      window.addEventListener("blur", function (e) {
        if (t.audioContext && t.audioContext.suspend) t.audioContext.suspend();
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
    this.ctx.fillRect(this.w / 2 - 25 * this.resourceCount + i * 50, this.h / 2 - 12, 50, 25);      
    this.ctx.fillText("loading...", this.w / 2, this.h / 2 - 50);
    var w = this;

    for (var i = 0; i < this.gameInfo.resources.length; i++ ) {
      var res = this.gameInfo.resources[i].path;
      var e = res.lastIndexOf(".");
      var name = this.gameInfo.resources[i].name !== undefined ? this.gameInfo.resources[i].name : res.substring(0, e);
      var ext = res.substring(e, res.length);
      if (ext == ".png" || ext == ".gif") {
        Resources[name] = {image: new Image(), frames: this.gameInfo.resources[i].frames || 1, speed: this.gameInfo.resources[i].speed || 1, animations: this.gameInfo.resources[i].animations || 1 };
        Resources[name].image.src = this.resource_path + res;
        Resources[name].image.onload = function () {
          w.progressBar();
        };
      }
      else if (ext == ".ogg") {
        this.loadOGG(res, name);
/*        Resources[name] = {sound: new Audio(this.resource_path + res, streaming=false)};
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
        request.open("GET", this.resource_path + res, true);
        request.onload = function () {
          w.sceneInfo = request.response;
          w.progressBar();
        };
        request.send();
      }
      else if (ext == ".json") {
        var request = new XMLHttpRequest();
        request.open("GET", this.resource_path + res, true);
        request.onload = function () {
          Resources[name] = JSON.parse(request.response);
          w.progressBar();
        };
        request.send();
      }
    }
  },
  loadOGG: function (res, name) {
    var w = this;
    // cant play ogg, load mp3
    /*if (name == "soundtrack" || name == "soundtrackFast") {
      this.progressBar();
    }*/
    if (this.audioType.length <= 0) {
      res = res.replace("ogg", "mp3");
      //console.log("replaced?");
    }
    //console.log("NEW", res);
    if (!AudioContext) {
      Resources[name] = new Audio(this.resource_path + res, streaming=false);
      //Resources[name].src = this.resource_path + res;
      w.progressBar();
      return;
    }
    var request = new XMLHttpRequest();
    request.open('GET', this.resource_path + res, true);
    request.responseType = 'arraybuffer';

    var w = this;
    request.onload = function() {
      w.audioContext.decodeAudioData(request.response, function(b) {
        Resources[name] = {buffer: b, play: false};
        if (false) {
//          if (AudioContext && Resources.soundtrack && name == "soundtrack") w.musicLoop();
        } else {
          w.progressBar();
        }
      }, function () {console.log("ERROR with decoding audio");});
    };
    request.send();
  },
  playSound: function(sound, volume) {
    if (AudioContext) {
      var volume = volume || 1;
      //console.log(sound);
      var buffer = sound.buffer;
      var source = this.audioContext.createBufferSource();
      source.buffer = buffer;
      
      source.connect(this.audioContext.gn);
      this.audioContext.gn.gain.value = volume;
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