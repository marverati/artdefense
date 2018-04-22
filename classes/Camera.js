


function Camera() {
    this.x = 0;
    this.y = 0;
    this.yScale = 0.5;
    this.setRotation( -Math.PI / 4 );
}

Camera.prototype.move = function(dx, dy) {
    this.setPos(this.x + dx, this.y + dy);
};

Camera.prototype.setPos = function(x, y) {
    this.x = x;
    this.y = y;
};

Camera.prototype.setRotation = function(angle) {
    this.rotation = angle;
    this.sin = Math.sin(angle);
    this.cos = Math.cos(angle);
};

Camera.prototype.applyTransform = function(ctx) {
    ctx.scale(1, this.yScale);
    ctx.rotate(this.rotation);
    ctx.translate(-this.x, -this.y);
};

Camera.prototype.transform = function(x, y, h) {
    // Translate
    x -= this.x;
    y -= this.y;
    // Rotate
    var cx = this.cos * x - this.sin * y;
    var cy = this.sin * x + this.cos * y;
    // Scale Y
    cy *= this.yScale;
    // Add height
    return [cx, cy - h];
};

Camera.prototype.detransform = function(canvas, mx, my) {
    // Screen center
    mx -= canvas.width / 2;
    my -= canvas.height / 2;
    // Scale accordingly
    mx /= 1.41421356;
    my /= 1.41421356 * this.yScale;
    // Convert screen to world coordinates
    var wx = mx - my;
    var wy = mx + my;
    // Camera offset
    wx += this.x;
    wy += this.y;
    return [wx, wy];
};

Camera.prototype.contain = function(x1, y1, x2, y2) {
    this.x = Math.min(x2, Math.max(x1, this.x));
    this.y = Math.min(y2, Math.max(y1, this.y));
};
