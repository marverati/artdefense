

function Enemy(tile) {
    this.tile = tile;
    this.startTile = tile;
    this.targetTile = tile;
    this.x = tile.x;
    this.y = tile.y;
    this.targetRotation = 0;
    this.rotation = game ? game.camera.rotation + Math.PI / 2 : 0;
    this.speed = 0.1;
    this.h = 50;
    this.width = 80;
    this.height = 120;
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width * 5;
    this.canvas.height = this.height * 5;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "#eee";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.moveOn();
}

Enemy.prototype.update = function(dt) {
    // Move towards target tile
    this.targetProgress += dt * this.speed;
    // Check if target was reached
    if (this.targetProgress >= this.targetDistance) {
        // Reached goal?
        if (this.targetTile.tp == TILE_TARGET) {
            return true;
        }
        // Reached target tile, move on to next one
        this.moveOn();
    }
    // Update position
    var p = this.targetProgress / this.targetDistance;
    var p1 = 1 - p;
    this.x = p1 * this.startTile.x + p * this.targetTile.x;
    this.y = p1 * this.startTile.y + p * this.targetTile.y;
    this.tile = this.tile.level.get(this.x, this.y);
    // Update rotation
    if (this.rotation != this.targetRotation) {
        if (this.rotation < this.targetRotation) {
            this.rotation += dt * this.speed * 0.03;
            if (this.rotation >= this.targetRotation) { this.rotation = this.targetRotation; }
        } else {
            this.rotation -= dt * this.speed * 0.03;
            if (this.rotation <= this.targetRotation) { this.rotation = this.targetRotation; }
        }
    }
};

Enemy.prototype.moveOn = function() {
    var tile = this.targetTile;
    this.startTile = this.tile = tile;
    this.targetTile = this.targetTile.getNextTile();
    var dx = this.targetTile.x - tile.x, dy = this.targetTile.y - tile.y;
    this.targetDistance = Math.sqrt( dx * dx + dy * dy );
    this.targetProgress = 0;
    this.targetRotation = Math.atan2(dx, dy) + Math.PI / 2;
    var rdis = (this.rotation - this.targetRotation) % (2 * Math.PI);
    if (Math.abs(rdis) < Math.PI) {
        this.rotation = this.targetRotation + rdis;
    } else {
        this.rotation = this.targetRotation + ((2 * Math.PI + rdis) % (2 * Math.PI))
    }
};

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
