
function Spawn(x, y) {
    this.startX = x;
    this.startY = y;
    this.endX = x;
    this.endY = y;
    this.path = [[x, y]];
}

Spawn.prototype.moveDown = function(v) {
    this.endY += v;
    this.path.push([this.endX, this.endY]);
    return this;
};

Spawn.prototype.moveUp = function(v) {
    this.endY -= v;
    this.path.push([this.endX, this.endY]);
    return this;
};

Spawn.prototype.moveRight = function(v) {
    this.endX += v;
    this.path.push([this.endX, this.endY]);
    return this;
};

Spawn.prototype.moveLeft = function(v) {
    this.endX -= v;
    this.path.push([this.endX, this.endY]);
    return this;
};




function Level(w, h, trgx, trgy, spawns) {
    this.w = w;
    this.h = h;
    this.targetX = trgx;
    this.targetY = trgy;
    this.tiles = [];
    for (var y = 0; y < h; y++) {
        this.tiles[y] = [];
        for (var x = 0; x < w; x++) {
            this.tiles[y][x] = new Tile();
        }
    }
    this.spawns = spawns instanceof Array ? spawns : [ spawns ];
    // Apply Spawn and Path tiles
    for (var spawn of this.spawns) {
        this.tiles[spawn.startY][spawn.startX].tp = TILE_SPAWN;
        // connect path nodes
        for (var i = 1; i < spawn.path.length; i++) {
            var prev = spawn.path[i - 1];
            var current = spawn.path[i];
            var dx = current[0] - prev[0], dy = current[1] - prev[1];
            var steps = Math.abs(dx) + Math.abs(dy);
            for (var s = 1; s <= steps; s++) {
                var f = s / steps;
                var tx = prev[0] + Math.round(f * dx),
                    ty = prev[1] + Math.round(f * dy);
                this.tiles[ty][tx].tp = TILE_PATH;
            }
        }
    }
    // Target tile
    this.tiles[trgy][trgx].tp = TILE_TARGET;
    this.canvas = null;
}

Level.prototype.forAllTiles = function(handler) {
    for (var y = 0; y < this.h; y++) {
        for (var x = 0; x < this.w; x++) {
            handler(this.tiles[y][x], x, y);
        }
    }
}

Level.prototype.renderToCanvas = function(cnv) {
    if (cnv) {
        this.canvas = cnv;
    } else {
        cnv = this.canvas;
    }

    var tileSize = 96;
    var w = this.w * tileSize;
    var h = this.h * tileSize;
    cnv.width = w + 1;
    cnv.height = h + 1;
    var ctx = cnv.getContext("2d");

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Tiles
    this.forAllTiles(function(t, x, y) {
        if (t.tp.color) {
            ctx.fillStyle = t.tp.color;
            ctx.fillRect(tileSize * x, tileSize * y, tileSize, tileSize);
        }
    });

    // Framing
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    var segment = 8;
    ctx.setLineDash([segment, segment]);
    for (var x = 0; x <= this.w; x++) {
        ctx.beginPath();
        ctx.moveTo(tileSize * x, -segment / 2);
        ctx.lineTo(tileSize * x, tileSize * this.h + segment);
        ctx.stroke();
    }
    for (var y = 0; y <= this.h; y++) {
        ctx.beginPath();
        ctx.moveTo(-segment / 2, tileSize * y);
        ctx.lineTo(tileSize * this.w + segment, tileSize * y);
        ctx.stroke();
    }
};
