


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
