
Gun.blobImage = loader.loadImage("img/blob.png");
Gun.splashImage = loader.loadImage("img/splash.png");
Gun.upgradeImage = loader.loadImage("img/upgrade.png");
Gun.upgradeSlotImage = loader.loadImage("img/upgradeSlot.png");

var GUN_YELLOW = new GunType("Yellow", "#ffd820", 3, 250, 270, 1, 0.3, 0.5);
var GUN_GREEN = new GunType("Green", "#30c010", 5, 800, 300, 0.62, 0.8, 0.5);
var GUN_BLUE = new GunType("Blue", "blue", 6, 1200, 420, 0.75, 1, 1);
var GUN_RED = new GunType("Red", "red", 12, 1000, 380, 0.85, 0.75, 1);

var TYPE_BLANC = new GunType("Blanc", "#eee");

function GunType(name, color, damage, delay, range, bulletSpeed, splashScale, scattering) {
    this.name = name;
    this.color = color;
    this.damage = damage;
    this.delay = delay;
    this.range = range;
    this.bulletSpeed = bulletSpeed;
    this.splashScale = splashScale;
    this.scattering = scattering;
    this.image = document.createElement("canvas");
    this.splash = document.createElement("canvas"); 
    var self = this;
    loader.registerAnonymousMedia(2);
    loader.finishImage(Gun.blobImage).then(function() {
        colorize(self.image, Gun.blobImage, self.color);
        loader.finishAnonymousMedia();
    });
    loader.finishImage(Gun.splashImage).then(function() {
        colorize(self.splash, Gun.splashImage, self.color);
        loader.finishAnonymousMedia();
    });

    function colorize(cnv, base, color) {
        cnv.width = base.width;
        cnv.height = base.height;
        var ctx = cnv.getContext("2d");
        ctx.drawImage(base, 0, 0);
        ctx.globalCompositeOperation = "color";
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, cnv.width, cnv.height);
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(base, 0, 0);
    }
}

function Gun(game, tile, type) {
    if (tile.tp != TILE_EMPTY) {
        console.error("Tried to add Gun to non-empty tile: " + type + " on " + tile.tx + "," + tile.ty + " (" + tile.tp.name + ")");
    }
    tile.setGun(this);
    this.game = game;
    this.tile = tile;
    this.tp = type;
    this.x = this.tile.x;
    this.y = this.tile.y;
    this.target = null;
    this.nextShot = 0;
    this.delay = type.delay;
    this.bulletSpeed = type.bulletSpeed;
    this.splashScale = type.splashScale;
    this.scattering = type.scattering;
    this.damage = type.damage;
    this.range = type.range;
    this.range2 = this.range * this.range;
    this.rotation = 0;
    this.bulletJump = 0;
    this.sprinkler = false;
    this.shootBack = false;
    this.shootSides = false;
    this.shootSpray = false;
    this.lifeGenerator = false;
    this.upgradeSlots = 1;
    this.upgrades = 0;
}

Gun.prototype.render = function(ctx, camera) {
    var [x, y] = camera.transform(this.tile.x, this.tile.y, 25);
    drawShadow(ctx, x, y + 25, 0.4);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(0.5, 0.5);
    ctx.drawImage(this.tp.image, -this.tp.image.width / 2, -this.tp.image.height / 2);
    ctx.restore();
    // Upgrades
    if (this.upgrades > 0 || this.upgradeSlots > 1) {
        var w = 20;
        var h = w * 0.75;
        for (var i = 0; i < this.upgradeSlots; i++) {
            ctx.drawImage( (i < this.upgrades) ? Gun.upgradeImage : Gun.upgradeSlotImage, x - w/2, y + 16 - 0.5 * w * i, w, h);
        }
    }
};

Gun.prototype.update = function(dt, t) {
    if (t >= this.nextShot) {
        if (this.sprinkler) {
            this.target = null;
            if (game.enemies.length <= 0) { return; }
            // Handle delay to next shot
            this.nextShot += this.delay;
            if (this.nextShot <= t) { this.nextShot = t + this.delay; }
            // Create bullet
            var ang = 0.002 * t;
            var dis = this.range * 0.8;
            var tx = this.x + dis * Math.sin(ang);
            var ty = this.y + dis * Math.cos(ang);
            this.shootTo(tx, ty, t);
            return;
        }
        // Target
        if (this.target == null || !this.target.alive) {
            this.target = Gun.getTarget(this.x, this.y, this.range, this.tp);
            if (this.target == null) {
                return;
            }
        } else {
            // Out of range?
            if (!this.isInRange(this.target.x, this.target.y)) {
                this.target = null;
                return;
            }
        }
        this.shootTo(this.target.x, this.target.y, t);
    }
};

    Gun.prototype.shootTo = function(x, y, t) {
        var self = this;

        // Handle delay to next shot
        this.nextShot += this.delay;
        if (this.nextShot <= t) {
            this.nextShot = t + this.delay;
        }
        // Create bullet
        var [vx, vy, vh] = this.getBulletVelocity(this.tile.x, this.tile.y, 10, x, y, 30 + 80 * Math.random());
        createBullet(vx, vy, vh);
        if (this.shootBack) {
            createBullet(-vx, -vy, vh);
        }
        if (this.shootSides) {
            createBullet(vy, -vx, vh);
            createBullet(-vy, vx, vh);
        }
        if (this.shootSpray) {
            var ang = 0.3;
            var sin = Math.sin(ang), cos = Math.cos(ang);
            createBullet(cos * vx - sin * vy,  sin * vx + cos * vy, vh);
            createBullet(cos * vx + sin * vy, -sin * vx + cos * vy, vh);
        }

        function createBullet(vx, vy, vh) {
            var bullet = new Bullet(self, self.bulletSpeed * vx, self.bulletSpeed * vy, self.bulletSpeed * vh);
            self.game.bullets.push(bullet);
            self.game.renderSorter.add(bullet);
        }
    }

    Gun.prototype.getBulletVelocity = function(sx, sy, sh, tx, ty, th) {
        var dx = tx - sx;
        var dy = ty - sy;
        var dis = Math.sqrt(dx * dx + dy * dy) + 40 * Math.random() * this.scattering;
        var angle = Math.atan2(dx, dy) + 0.2 * (Math.random() - Math.random()) * this.scattering;
        var vx = Math.sin(angle);
        var vy = Math.cos(angle);
        var steps = dis / this.bulletSpeed;
        var fallOff = 0.5 * BULLET_GRAVITY * steps * steps;
        var vh = (fallOff + th - sh) / steps + this.scattering * (Math.random() * 0.3 - Math.random() * 0.2);
        return [vx, vy, vh];
    }

Gun.getTarget = function(x, y, range, excludeType, excludeEnemy) {
    var range2 = range * range;
    var enemies = game.enemies.filter(function(e) {
        var dx = e.x - x, dy = e.y - y;
        return e.type != excludeType && dx * dx + dy * dy <= range2 && e != excludeEnemy;
    });
    if (enemies.length < 1) {
        return null;
    }
    return enemies[0];
};

Gun.prototype.isInRange = function(x, y) {
    var dx = x - this.tile.x, dy = y - this.tile.y;
    return dx * dx + dy * dy <= this.range2;
};
