
Gun.blobImage = loader.loadImage("img/blob.png");

var GUN_YELLOW = new GunType("Yellow", "yellow");
var GUN_GREEN = new GunType("Green", "green");
var GUN_BLUE = new GunType("Blue", "blue");
var GUN_RED = new GunType("Red", "red");

function GunType(name, color) {
    this.name = name;
    this.color = color;
    this.image = document.createElement("canvas");
    var self = this;
    loader.registerAnonymousMedia();
    loader.finishImage(Gun.blobImage).then(function() {
        self.image.width = Gun.blobImage.width;
        self.image.height = Gun.blobImage.height;
        var ctx = self.image.getContext("2d");
        ctx.drawImage(Gun.blobImage, 0, 0);
        ctx.globalCompositeOperation = "color";
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, self.image.width, self.image.height);
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(Gun.blobImage, 0, 0);
        loader.finishAnonymousMedia();
    });
}

function Gun(game, tile, type) {
    if (tile.tp != TILE_EMPTY) {
        throw new Error("Tried to add Gun to non-empty tile: " + type + " on " + tile.tx + "," + tile.ty + " (" + tile.tp.name + ")");
    }
    tile.setGun(this);
    this.game = game;
    this.tile = tile;
    this.tp = type;
    this.x = this.tile.x;
    this.y = this.tile.y;
    this.target = null;
    this.nextShot = 0;
    this.delay = 400;
    this.bulletSpeed = 1.5;
    this.damage = 10;
    this.range = 420;
    this.range2 = this.range * this.range;
    this.rotation = 0;
}

Gun.prototype.render = function(ctx, camera) {
    var [x, y] = camera.transform(this.tile.x, this.tile.y, 25);
    drawShadow(ctx, x, y + 25, 0.4);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(0.5, 0.5);
    ctx.drawImage(this.tp.image, -this.tp.image.width / 2, -this.tp.image.height / 2);
    ctx.restore();
};

Gun.prototype.update = function(dt, t) {
    if (t >= this.nextShot) {
        // Target
        if (this.target == null || !this.target.alive) {
            // Find new target
            var self = this;
            var enemies = this.game.enemies.filter(function(e) {
                return self.isInRange(e.x, e.y);
            });
            if (enemies.length < 1) {
                this.target = null;
                return;
            }
            this.target = enemies[0];
        }
        // Handle delay to next shot
        this.nextShot += this.delay;
        if (this.nextShot <= t) {
            this.nextShot = t + this.delay;
        }
        // Create bullet
        var dx = this.target.x - this.tile.x;
        var dy = this.target.y - this.tile.y;
        var dis = Math.sqrt(dx * dx + dy * dy) + 40 * Math.random();
        var angle = Math.atan2(dx, dy) + 0.2 * (Math.random() - Math.random());
        var vx = Math.sin(angle);
        var vy = Math.cos(angle);
        var vh = 0.1 + Math.min(1, dis / 3000) + Math.random() * 0.3 - Math.random() * 0.2;
        var bullet = new Bullet(this, this.bulletSpeed * vx, this.bulletSpeed * vy, this.bulletSpeed * vh);
        this.game.bullets.push(bullet);
        this.game.renderSorter.add(bullet);
    }
};

Gun.prototype.isInRange = function(x, y) {
    var dx = x - this.tile.x, dy = y - this.tile.y;
    return dx * dx + dy * dy <= this.range2;
};
