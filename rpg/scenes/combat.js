var onStart = function () {
  var combat = this;
  
  /////////////////////////////
  // COMBAT OBJECT STRUCTURE //
  /////////////////////////////
  // 
  // Stats: Root Object (contains HP, MP, VULN, etc.)
  // Sprite: Portrait/In-Game visuals
  // HP_text: Shows current HP: could replace with multiple stat-bars
  // Cursor: Shows currently selected
  // 
  // ADD:
  // Status effects: (Array of icon sprites)


  this.bg = this.add(Object.create(Layer).init(game.w, game.h));
  this.bg.add(Object.create(SpriteFont).init(Resources.font, "COMBAT")).set({x: 6, y: 16, z: 5, align: "left", spacing: -2});

  this.player = {hp: 10, mp: 10, vuln: "physical"};
  this.player.sprite = this.bg.add(Object.create(Sprite).init(Resources.portrait)).set({x: game.w / 2, y: game.h - 40, z: 1});
  this.player.cursor = {};

  // UI Bar (bottom)
  this.bg.add(Object.create(Entity).init()).set({x: game.w / 2, y: game.h - 12, h: 24, w: game.w, z: 1});
  this.bg.add(Object.create(Entity).init()).set({x: game.w / 2, y: game.h - 12, h: 20, w: game.w - 4, z: 2, color: "white"});

  this.player.hp_text = this.bg.add(Object.create(SpriteFont).init(Resources.font, this.player.hp + "hp")).set({x: game.w / 2, y: game.h - 12, z: 3, align: "left"});

  this.enemies = [];
  // arange in a semi-circle (12 -> 3pm) depending on length
  var theta = (PI / 2) / fight.enemies.length;
  for (var i = 0; i < fight.enemies.length; i++) {
    var e = Object.create(Combat).init({hp: 10, mp: 10, vuln: 'fire'});
    e.sprite = this.bg.add(Object.create(Sprite).init(fight.enemies[i].sprite)).set({x: this.player.sprite.x + Math.cos(3 * PI / 2 + i * theta) * 80, y: this.player.sprite.y + Math.sin(3 * PI / 2 + i * theta) * 80 });
    e.hp_text = this.bg.add(Object.create(SpriteFont).init(Resources.font, "10hp")).set({x: e.sprite.x, y: e.sprite.y - 12 });
    e.cursor = this.bg.add(Object.create(SpriteFont).init(Resources.font, "^")).set({x: e.sprite.x, y: e.sprite.y + 12, opacity: 0, z: 5});
    e.choose = function () { return choose(this.abilities); };
    e.abilities = [
      Object.create(Bash).init([this.player])
    ];
    this.enemies.push(e);
  }
  //this.enemies[this.cursor].opacity = 1;

  this.hp = fight.player.hp;
  
  /*this.abilities = [];
  
  for (var i = 0; i < fight.player.abilities.length; i++) {
    this.abilities.push(this.bg.add(Object.create(SpriteFont).init(Resources.font, fight.player.abilities[i].name)).set({x: 16, y: game.h / 4 + i * 16, align: "left", opacity: 0.5}));    
  }
  this.abilities[this.cursor].opacity = 1;*/

  this.bg.add(Object.create(Entity).init()).set({x: game.w / 8, y: game.h / 2, h: game.h, w: game.w / 4, z: 2});
  this.bg.add(Object.create(Entity).init()).set({x: game.w / 8, y: game.h / 2, h: game.h - 4, w: game.w / 4 - 4, z: 3, color: "white"});

  this.ability_menu = this.bg.add(Object.create(Menu).init(Resources.font, combat_menu)).set({x: 6, y: game.h / 2, align: "left", spacing: -2, z: 5});

  this.turn = 0;
  this.status = function () {
    for (var i = this.enemies.length - 1; i >= 0; i--) {
      this.enemies[i].hp_text.text = this.enemies[i].hp + "hp";
      console.log(this.enemies[i].hp, 'status');
      if (this.enemies[i].hp <= 0) {
        this.enemies[i].alive = false;
        this.enemies.splice(i, 1);
      }
    }
    this.player_hp.text = fight.player.hp + "hp";
    if (this.enemies.length <= 0) {
      game.setScene(0, false);
    } else if (fight.player.hp <= 0) {
      game.setScene(2, false);
      game.scene.layers = [];
      game.scene.onStart();
    }
    this.turn = modulo(this.turn + 1, this.enemies.length + 1);
    this.cooldown = 0.5;
  };
  this.cooldown = 0;

  this.onKeyDown = function (e) {
    if (combat.turn === 0) {
      switch (e.keyCode) {
        case 38:
          if (this.ability) {
            if (!this.ability.targets) {
              this.ability.targeting.previous();
            }
          } else {
            this.ability_menu.previous();
          }
          break;
        case 40:
          if (this.ability) {
            if (!this.ability.targets) {
              this.ability.targeting.next();              
            }
          } else {
            this.ability_menu.next();
          }
          break;
        case 32:
          if (this.ability) {
            if (!this.ability.targets) {
              this.ability.target();
            } else {
              this.ability.act();
              this.ability = undefined;
              this.turn += 1;
              this.cooldown = 0.4
            }
          } else {
            var a = this.ability_menu.down();
            if (a) {
              this.ability = Object.create(a).init(combat.enemies);
            }
          }
          /*  combat.targeted = combat.cursor;
            targets = fight.player.abilities[   combat.selected].target(combat.enemies, combat.targeted);
            fight.player.abilities[combat.selected].act(targets);
            combat.status();
            this.selected = undefined;
            this.targeted = undefined;
            this.cursor = 0;   */         
          break;
        case 27:
          if (this.ability) {
            if (this.ability.targets) {
              this.ability.targets = undefined;
            } else {
              this.ability = undefined;
            } 
          } else {
            this.ability_menu.up();            
          }
          //game.setScene(0, false);
          break;
      }
    }
  };
  this.ready = true; // raindrop --> SOMETHING ELSE
};

var onUpdate = function (dt) {
  if (this.cooldown > 0) {
    this.cooldown -= dt;
    return;
  } else if (this.turn !== 0) {
    this.enemies[this.turn - 1].abilities[0].target();
    this.enemies[this.turn - 1].abilities[0].act();
    this.turn = modulo(this.turn + 1, this.enemies.length + 1);
    this.cooldown = 1;
  }
}