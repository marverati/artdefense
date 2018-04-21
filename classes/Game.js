

function Game(canvas) {
    this.level = null;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.levelCanvas = document.createElement("canvas");
    this.camera = new Camera();

    this.initializeControls();

    requestAnimationFrame(this.update.bind(this));
}

Game.prototype.loadLevel = function(level) {
    this.level = level;
    this.level.renderToCanvas(this.levelCanvas);
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
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Isometry
    this.ctx.save();
    this.camera.applyTransform(this.ctx);

    // Level Paint
    // TODO

    // Level Geometry
    this.ctx.drawImage(this.levelCanvas, 0, 0);

    this.ctx.restore();

    // Canvases, Guns and Blobs
};


Game.prototype.initializeControls = function() {
    document.body.addEventListener("keydown", this.handleKey.bind(this));
};

Game.prototype.handleKey = function(e) {
    var rl = (e.key == "ArrowRight" ? 1 : 0) - (e.key == "ArrowLeft" ? 1 : 0);
    var ud = (e.key == "ArrowDown" ? 1 : 0) - (e.key == "ArrowUp" ? 1 : 0);
    if (rl || ud) {
        this.camera.move(32 * rl, 32 * ud);
    }
};
