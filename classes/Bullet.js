
var BULLET_GRAVITY = 0.001;

function Bullet(gun, vx, vy, vh) {
    this.gun = gun;
    var skip = 3;
    this.x = gun.tile.x + skip * vx;
    this.y = gun.tile.y + skip * vy;
    this.h = 25 + skip * vh;
    this.vx = vx;
    this.vy = vy;
    this.vh = vh;
}

Bullet.prototype.update = function(dt, t) {
    // Move
    this.x += dt * this.vx;
    this.y += dt * this.vy;
    this.h += dt * this.vh;
    // Gravity
    this.vh -= BULLET_GRAVITY * dt;
    // Collision
    var enemies = this.gun.game.enemies;
    for (var e of enemies) {
        var point = e.collidesWith(this.x, this.y, this.h, 10)
        if (point) {
            e.damage(this.gun.damage);
            // Blob dynamics
            this.splash(e, point);
            // Destroy this bullet
            return true;
        }
    }
    // Ground
    if (this.h < 1) {
        return true;
    }
};

Bullet.prototype.render = function(ctx, camera) {
    var [x, y] = camera.transform(this.x, this.y, this.h);

    // Shadow
    var f = this.h / 200;
    if (f < 1) {
        drawShadow(ctx, x, y + this.h, 0.1 + 0.35 * f, (1 - f) * 0.7);
    }

    // Blob
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 6.28);
    ctx.fillStyle = this.gun.tp.color;
    ctx.fill();
};

Bullet.prototype.splash = function(enemy, point) {
    this.particles = Math.round(8 + Math.random() * 13);
    var off = 36;
    for (var i = 0; i < this.particles; i++) {
        var x0 = this.x + off * rnd() * rnd();
        var y0 = this.y + off * rnd() * rnd();
        var h0 = this.h + off * rnd() * rnd();
        var step = 3, radius = 2;
        for (var s = 5; s >= -5; s--) {
            var x = x0 + step * s * this.vx;
            var y = y0 + step * s * this.vy;
            var h = h0 + step * s * this.vh;
            var p = enemy.collidesWith(x, y, h, radius);
            if (p) {
                enemy.splash(this.gun.tp.color, p);
                break;
            }
        }
    }
};
