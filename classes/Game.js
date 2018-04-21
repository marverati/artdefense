
const GAME_MAX_TD = 100;

function Game(canvas) {
    this.level = null;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.levelCanvas = document.createElement("canvas");
    this.camera = new Camera();
    
    this.lives = 10;

    this.gameSpeed = 1;

    this.guns = [];
    this.enemies = [];

    createLevels(this);

    this.initializeControls();

    this.tPrev = Date.now();
    this.tAbs = 0;
    this.update();
}

Game.prototype.loadLevel = function(level) {
    this.level = level;
    this.level.renderToCanvas(this.levelCanvas);

    this.bullets = [];
    this.enemies = [];
    this.guns = [ 
        new Gun(this, this.level.get(4, 6), GUN_GREEN),
        new Gun(this, this.level.get(8, 2), GUN_YELLOW),
        new Gun(this, this.level.get(2, 6), GUN_BLUE),
        new Gun(this, this.level.get(4, 1), GUN_RED)
    ];

    this.camera.setPos( this.level.w / 2 * TILE_SIZE, this.level.h / 2 * TILE_SIZE);
    this.render();
};

Game.prototype.update = function() {
    if (this.level) {
        this.updateControls();
        this.updateLogic();
        this.render();
    }

    requestAnimationFrame(this.update.bind(this));
};

Game.prototype.updateControls = function() {

};

Game.prototype.updateLogic = function() {
    // Timing
    var t = Date.now();
    var dt = (t - this.tPrev);
    if (dt > GAME_MAX_TD) { dt = GAME_MAX_TD; }
    dt = this.gameSpeed * dt;
    this.tAbs += dt;
    this.tPrev = t;

    // Level and spawning
    this.level.update(dt, this.tAbs);
    // Enemy movement
    var finished = [];
    for (var e of this.enemies) {
        var done = e.update(dt, this.tAbs);
        if (done) {
            finished.push(e);
        }
    }
    for (var e of finished) {
        this.handleFinishedEnemy(e);
    }
    // Guns
    for (var g of this.guns) {
        g.update(dt, this.tAbs);
    }
    // Bullets
    for (var b = this.bullets.length - 1; b >= 0; b--) {
        var done = this.bullets[b].update(dt, this.tAbs);
        if (done) {
            this.bullets.splice(b, 1);
        }
    }
};

    Game.prototype.handleFinishedEnemy = function(e) {
        var i = this.enemies.indexOf(e);
        if (i >= 0) {
            if (e.alive) {
                // When enemy is still alive while being destroyed, it reached the target; otherwise killed by bullet
                e.alive = false;
                this.lives--;
            }
            this.enemies.splice(i, 1);
        }
    }

Game.prototype.render = function() {
    // Clear
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Isometry
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.save();
    this.camera.applyTransform(this.ctx);

    // Level Paint
    // TODO

    // Level Geometry
    this.ctx.drawImage(this.levelCanvas, 0, 0);

    // Hover Effect
    // TODO

    this.ctx.restore();

    // Canvases, Guns and Bullets
    for (var e of this.enemies) {
        e.render(this.ctx, this.camera);
    }
    for (var g of this.guns) {
        g.render(this.ctx, this.camera);
    }
    for (var b of this.bullets) {
        b.render(this.ctx, this.camera);
    }
};

    Game.prototype.renderHover = function(tx, ty, colorOrValid) {
        var color = colorOrValid;
        if (typeof colorOrValid == "boolean") {
            color = colorOrValid ? "rgba(0,255,0,0.3)" : "rgba(255,0,0,0.3)";
        }
        this.ctx.fillStyle = color;
        this.ctx.fillRect(tx * TILE_SIZE, ty * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

Game.prototype.initializeControls = function() {
    document.body.addEventListener("keydown", this.handleKey.bind(this));
};

Game.prototype.handleKey = function(e) {
    var rl = (e.key == "ArrowRight" ? 1 : 0) - (e.key == "ArrowLeft" ? 1 : 0);
    var ud = (e.key == "ArrowDown" ? 1 : 0) - (e.key == "ArrowUp" ? 1 : 0);
    if (rl || ud) {
        var dx = 32 * (ud * this.camera.sin + rl * this.camera.cos);
        var dy = 32 * (ud * this.camera.cos - rl * this.camera.sin);
        this.camera.move(dx, dy);
    }
};
