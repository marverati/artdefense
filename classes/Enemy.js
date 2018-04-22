
const ROTATION = {
    DEFAULT: 0,
    SIDEWAYS: 1,
    SPINNING: 2,
    OSCILLATING: 3
}

function Enemy(tile, type, properties) {
    this.tile = tile;
    this.type = type;
    this.id = Enemy.count++;
    this.startTile = tile;
    this.targetTile = tile;
    this.x = tile.x;
    this.y = tile.y;
    
    this.alive = true;
    this.hp = 180;
    this.deathTime = 0;

    this.rotationType = ROTATION.DEFAULT;

    this.targetRotation = 0;
    this.rotation = game ? game.camera.rotation + Math.PI / 2 : 0;
    this.speed = 0.1;
    this.h = 15;
    this.width = 90;
    this.height = 120;

    // Behaviour
    this.confused = 0;
    this.poisoned = 0;
    this.frozen = 0;

    if (properties) {
        var keys = Object.keys(properties);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (this[key] != null) {
                this[key] = properties[key];
            }
        }
    }
    this.maxHp = this.hp;

    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width * 3;
    this.canvas.height = this.height * 3;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = type.color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.moveOn(0);
}

Enemy.count = 0; 

Enemy.prototype.update = function(dt, t) {
    if (!this.alive) {
        return true;
    }
    // States
    if (this.frozen) { this.frozen = Math.max(0, this.frozen - 1); }
    if (this.poisoned) { this.poisoned = Math.max(0, this.poisoned - 1); if (Math.random() < 0.2) { this.damage(1); } }
    if (this.confused) { this.confused = Math.max(0, this.confused - 1); }
    // Live rotation
    if (this.rotationType == ROTATION.SPINNING) {
        this.targetRotation = t * 0.002;
    } else if (this.rotationType == ROTATION.OSCILLATING) {
        this.targetRotation = this.originalTargetRotation + Math.PI * 0.2 * Math.sin(t * 0.003);
    }
    // Float in air
    this.h = 12 + 10 * Math.sin(t * 0.003 + this.id);
    // Move towards target tile
    var speed = this.speed;
    if (this.frozen) { speed *= 0.5; }
    if (this.poisoned) { speed *= 0.9; }
    if (this.confused) { speed *= -0.5; }
    this.targetProgress += dt * speed;
    // Check if target was reached
    if (this.targetProgress >= this.targetDistance) {
        // Reached goal?
        if (this.targetTile.tp == TILE_TARGET) {
            return true;
        }
        // Reached target tile, move on to next one
        this.moveOn(t);
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
            this.rotation += dt * speed * 0.03;
            if (this.rotation >= this.targetRotation) { this.rotation = this.targetRotation; }
        } else {
            this.rotation -= dt * speed * 0.03;
            if (this.rotation <= this.targetRotation) { this.rotation = this.targetRotation; }
        }
    }
};

Enemy.prototype.moveOn = function(t) {
    var tile = this.targetTile;
    this.startTile = this.tile = tile;
    this.targetTile = this.targetTile.getNextTile();
    var dx = this.targetTile.x - tile.x, dy = this.targetTile.y - tile.y;
    this.targetDistance = Math.sqrt( dx * dx + dy * dy );
    this.targetProgress = 0;
    var oldTarget = this.targetRotation;
    if (this.rotationType == ROTATION.DEFAULT || this.rotationType == ROTATION.OSCILLATING) {
        this.targetRotation = Math.atan2(dx, dy) + Math.PI / 2;
    } else if (this.rotationType == ROTATION.SIDEWAYS) {
        this.targetRotation = Math.atan2(dx, dy);
    }
    while (Math.abs(this.targetRotation - oldTarget) > Math.PI) {
        if (this.targetRotation > oldTarget) {
            this.targetRotation -= 2 * Math.PI;
        } else {
            this.targetRotation += 2 * Math.PI;
        }
    }
    this.originalTargetRotation = this.targetRotation;
    var rdis = (this.rotation - this.targetRotation) % (2 * Math.PI);
    if (Math.abs(rdis) < Math.PI) {
        this.rotation = this.targetRotation + rdis;
    } else {
        this.rotation = this.targetRotation + ((2 * Math.PI + rdis) % (2 * Math.PI))
    }
};

Enemy.prototype.render = function(ctx, camera) {
    var [x, y] = camera.transform(this.x, this.y, this.h);
    var rotation = camera.rotation - this.rotation + Math.PI / 2;
    ctx.save();
    ctx.translate(x, y);

    // shearing
    var sin = Math.sin(rotation), cos = Math.cos(rotation);
    ctx.transform(cos, sin * camera.yScale, 0, 1, 0, 0);
    // Shadow beneath
    drawShadow(ctx, 0, this.h, 0.6);
    // Actual image
    var x1 = -this.width / 2, y1 = -this.height;
    ctx.drawImage(this.canvas, x1, y1, this.width, this.height);
    // Back side
    if (angleDiff(this.rotation, camera.rotation) > 0) {
        // Translucent white
        ctx.fillStyle = "rgba(255,250,240,0.36)";
        ctx.fillRect(x1 + 1, y1 + 1, this.width - 2, this.height - 2);
        // Border
        var off = 3;
        ctx.strokeStyle = "#c0a060";
        ctx.lineWidth = off * 2;
        ctx.strokeRect(x1 + off, y1 + off, this.width - 2 * off, this.height - 2 * off);
    }
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
        this.deathTime = game.tAbs;
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
    var offx = w * Math.sin(this.rotation);
    var offy = h * Math.cos(this.rotation);
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

Enemy.prototype.spreadSplash = function(color, p) {
    renderSplash(this.ctx, color, x, y, ax, ay);
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

Enemy.prototype.simpleSplash = function(color, p) {
    var x = p[0] * this.canvas.width, y = (1 - p[1]) * this.canvas.height;
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 18 + Math.random() * 20 - Math.random(8), 0, 6.28);
    this.ctx.fill();
};

Enemy.prototype.splash = function(img, x, y, scale) {
    var x = x * this.canvas.width, y = (1 - y) * this.canvas.height;
    renderCanvasSplash(this.ctx, img, x, y, scale);
};

function renderCanvasSplash(ctx, img, x, y, scale) {
    var sc = scale * (1 - 0.4 * Math.random());
    var sz = img.width * sc;
    ctx.drawImage(img, x - sz / 2, y - sz / 2, sz, sz);
}

function angleDiff(a1, a2) {
    var dif = (a2 - a1) % (2 * Math.PI);
    return dif > Math.PI ? dif - 2 * Math.PI : dif < -Math.PI ? dif + 2 * Math.PI : dif;
}