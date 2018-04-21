

function Enemy(tile) {
    this.tile = tile;
    this.targetTile = tile;
    this.x = tile.x;
    this.y = tile.y;
    this.rotation = 0;
    this.h = 50;
    this.width = 80;
    this.height = 120;
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width * 5;
    this.canvas.height = this.height * 5;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "#eee";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
}

Enemy.prototype.render = function(ctx, camera) {
    var [x, y] = camera.transform(this.x, this.y, this.h);
    var rotation = this.rotation - camera.rotation;
    ctx.save();
    ctx.translate(x, y);
    // shearing
    var sin = Math.sin(rotation), cos = Math.cos(rotation);
    ctx.transform(cos, sin * camera.yScale, 0, 1, 0, 0);
    ctx.drawImage(this.canvas, -this.width / 2, -this.height, this.width, this.height);
    ctx.restore();
};
