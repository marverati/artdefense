
function Enemy(tile) {
    this.tile = tile;
    this.id = Enemy.count++;
    this.startTile = tile;
    this.targetTile = tile;
    this.x = tile.x;
    this.y = tile.y;

    this.alive = true;
    this.maxHp = 550;
    this.hp = this.maxHp;

    this.targetRotation = 0;
    this.rotation = game ? game.camera.rotation + Math.PI / 2 : 0;
    this.speed = 0.1;
    this.h = 15;
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

Enemy.count = 0; 

Enemy.prototype.update = function(dt, t) {
    if (!this.alive) {
        return true;
    }
    // Float in air
    this.h = 12 + 10 * Math.sin(t * 0.003 + this.id);
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

    // Health bar
    if (this.hp <= this.maxHp) {
        drawHealthbar(ctx, x, y - 140, this.hp / this.maxHp);
    }
};

function drawHealthbar(ctx, x, y, p) {
    var w = 80, h = 4;
    var x1 = x - w / 2, y1 = y;
    var x2 = x1 + w, y2 = y1 + h;
    // Outline
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.lineWidth = 1;
    var padding = 2;
    ctx.strokeRect(x1 - padding, y1 - padding, w + 2 * padding, h + 2 * padding);
    // Fill
    if (p < 0.5) {
        var r = 255, g = Math.round(510 * p), b = 0;
    } else {
        var r = Math.round(510 * (1 - p)), g = 255, b = 0;
    }
    ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
    ctx.fillRect(x1, y1, p * w, h);
}

Enemy.prototype.damage = function(dmg) {
    this.hp -= dmg;
    if (this.hp <= 0) {
        this.alive = false;
    }
};

Enemy.prototype.collidesWith = function(x, y, h, r) {
    // Right height for collision?
    if (h > this.h + this.height + r || h < this.h - r) {
        return false;
    }
    // Check distance in x/y plane
    var dx = x - this.x, dy = y - this.y;
    var w = this.width / 2;
    var minDis = w + r;
    if (dx * dx + dy * dy > minDis * minDis) {
        return false;
    }
    // Minimum distance met to calculate collision properly
    var offx = w * Math.cos(this.rotation);
    var offy = h * Math.sin(this.rotation);
    var x1 = this.x - offx, x2 = this.x + offx;
    var y1 = this.y - offy, y2 = this.y + offy;
    var p = projectPointOnLine(x, y, x1, y1, x2, y2, true);
    dx = p[0] - x, dy = p[1] - y;
    if (dx * dx + dy * dy <= r * r) {
        // p is absolute point in 2D x/y space, now transform into relative canvas space
        var sx = p[2], sy = (h - this.h) / this.height;
        return [sx, sy];
    }
};

function projectPointOnLine(x, y, x1, y1, x2, y2, limitToLine) {
    var dx = x2 - x1, dy = y2 - y1;
    var s = (dx * (x - x1) + dy * (y - y1)) / (dx * dx + dy * dy);
    if (limitToLine) {
        s = (s < 0) ? 0 : (s > 1) ? 1 : s;
    }
    return [x1 + s * dx, y1 + s * dy, s];
}

Enemy.prototype.splash = function(color, p) {
    var x = p[0] * this.canvas.width, y = (1 - p[1]) * this.canvas.height;
    this.ctx.fillStyle = color;
    var count = 3 + 12 * Math.random() * Math.random();
    for (var i = 0; i < count; i++) {
        var ox = 50 * Math.pow(Math.random(), 2) * (Math.random() > 0.5 ? 1 : -1);
        var oy = 50 * Math.pow(Math.random(), 2) * (Math.random() > 0.5 ? 1 : -1);
        this.ctx.beginPath();
        this.ctx.arc(x + ox, y + oy, 10 + Math.random() * 25, 0, 6.28);
        this.ctx.fill();
    }
};
