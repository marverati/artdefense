

function Game(canvas) {
    this.level = null;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.levelCanvas = document.createElement("canvas");
    this.camera = new Camera();

    this.guns = [];
    this.enemies = [];

    this.initializeControls();

    requestAnimationFrame(this.update.bind(this));
}

Game.prototype.loadLevel = function(level) {
    this.level = level;
    this.level.renderToCanvas(this.levelCanvas);
    this.enemies = [ new Enemy(this.level.get(7, 7)) ];
    this.camera.setPos( this.level.w / 2 * TILE_SIZE, this.level.h / 2 * TILE_SIZE);
    this.render();
};

Game.prototype.update = function() {
    this.updateControls();
    this.updateLogic();
    this.render();

    requestAnimationFrame(this.update.bind(this));
};

Game.prototype.updateControls = function() {

};

Game.prototype.updateLogic = function() {

};

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
    this.renderHover(5, 4, true);
    this.renderHover(5, 5, true);

    this.ctx.restore();

    // Canvases, Guns and Blobs
    for (var e of this.enemies) {
        e.rotation = Date.now() * 0.001;
        e.render(this.ctx, this.camera);
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
