var gameWorld2 = Object.create(World).init(320, 180, "demo_resource.json");

var Cursor = Object.create(Behavior);
Cursor.draw = function (ctx) {
  if (this.entity.stopped) {
    ctx.beginPath();
    ctx.strokeStyle = this.color || "black";
    ctx.lineWidth = this.width || 2;    
    for (var i = 0; i < 8; i++) {
      ctx.moveTo(this.entity.x + Math.cos(this.angle) * i * 8, this.entity.y + Math.sin(this.angle) * i * 8);
      ctx.lineTo(this.entity.x + Math.cos(this.angle) * (i + 0.5) * 8, this.entity.y + Math.sin(this.angle) * (i + 0.5) * 8);
    }
    ctx.rect(this.entity.x + Math.cos(this.angle) * 64 - 4, this.entity.y + Math.sin(this.angle) * 64 - 4, 8, 8)
    ctx.stroke();
  }
};