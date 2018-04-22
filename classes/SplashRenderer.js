
function renderSplash(ctx, color, x, y, ax, ay) {
    ctx.fillStyle = color;

    var distance = 30;
    var dx = distance * Math.sin(ay) * Math.cos(ax);
    var dy = distance * Math.cos(ay) * Math.sin(ax);
    var sx = x - dx;
    var sy = y - dy;
    var sz = -Math.sqrt(distance * distance - dx * dx - dy * dy);

    var count = 10 + Math.random() * 20;
    count = 1;
    var sizeFactor = 20 / (10 + count);


    for (var i = 0; i < count; i++) {
        // Generate single blob
        var startx = sx + 12 * rnd();
        var starty = sy + 12 * rnd();
        var startz = sz + 5 * rnd();
        var anglex = ax + 1.6 * rnd();
        var angley = ay + 1.6 * rnd();
        renderBlob(ctx, startx, starty, startz * sizeFactor, anglex, angley);
    }
}

// Individual semi-circular shape
function renderBlob(ctx, sx, sy, sz, ax, ay) {
    var max = 1.1;
    if (Math.abs(ax) > max) { ax = ax > 0 ? max : -max; }
    if (Math.abs(ay) > max) { ay = ay > 0 ? max : -max; }
    var nodeAngleSpan = 0.3;
    if (Math.abs(ax) < Math.PI / 2 && Math.abs(ay) < Math.PI / 2) {
        // Only then the ray will hit the surface
        var nodes = 64;
        for (var n = 0; n < nodes; n++) {
            var nAng = 2 * Math.PI * n / nodes;
            // Single projection of one outer point of the blob
            var nax = ax + (1 + rnd() * rnd() * 0.0) * nodeAngleSpan * Math.cos(nAng);
            var nay = ay + (1 + rnd() * rnd() * 0.0) * nodeAngleSpan * Math.sin(nAng);
            // Project this node's angle on surface, from start position
            var tx = sx - sz * Math.tan(nay);
            var ty = sy - sz * Math.tan(nax);
            if (n == 0) {
                ctx.beginPath();
                ctx.moveTo(tx, ty);
            } else {
                ctx.lineTo(tx, ty);
            }
        }
        // Draw blob
        ctx.closePath();
        ctx.fill();
    }
}