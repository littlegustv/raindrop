var onStart = function () {
  this.bg = this.add(Object.create(Layer).init(game.w, game.h));
  this.bg.add(Object.create(SpriteFont).init(Resources.font, "game over.")).set({x: game.w / 2, y: game.h / 2});
  this.onKeyDown = function (e) {
    game.setScene(0, false);
  }
  this.ready = true;
};