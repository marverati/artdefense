
const TILE_SIZE = 96;

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




function Level(game, w, h, trgx, trgy, spawns, waves) {
    this.game = game;
    this.w = w;
    this.h = h;
    this.targetX = trgx;
    this.targetY = trgy;
    this.tiles = [];
    for (var y = 0; y < h; y++) {
        this.tiles[y] = [];
        for (var x = 0; x < w; x++) {
            this.tiles[y][x] = new Tile(this, x, y, (x + 0.5) * TILE_SIZE, (y + 0.5) * TILE_SIZE);
        }
    }
    this.spawns = spawns instanceof Array ? spawns : [ spawns ];
    // Apply Spawn and Path tiles
    for (var spawn of this.spawns) {
        var prevTile = this.tiles[spawn.startY][spawn.startX];
        prevTile.tp = TILE_SPAWN;
        // connect path nodes; for each segment:
        for (var i = 1; i < spawn.path.length; i++) {
            var prev = spawn.path[i - 1];
            var current = spawn.path[i];
            var goal = this.get(current[0], current[1]);
            var dx = current[0] - prev[0], dy = current[1] - prev[1];
            var steps = Math.abs(dx) + Math.abs(dy);
            // update target of very first tile
            this.tiles[prev[1]][prev[0]].addNextTile(goal);
            // for each tile of segment:
            for (var s = 1; s <= steps; s++) {
                var f = s / steps;
                var tx = prev[0] + Math.round(f * dx),
                    ty = prev[1] + Math.round(f * dy);
                this.tiles[ty][tx].tp = TILE_PATH;
                this.tiles[ty][tx].addNextTile(goal);
            }
        }
    }
    // Target tile
    this.targetTile = this.get(trgx, trgy);
    this.targetTile.tp = TILE_TARGET;

    // Waves
    this.currentWave = 0;
    this.waves = waves;
    this.waveStarted = true;
    for (var wave of this.waves) {
        wave.level = this;
    }

    // Store canvas to render self into on updates
    this.canvas = null;
}

Level.prototype.get = function(x, y) {
    x = (x < 0) ? 0 : (x >= this.w) ? this.w - 1 : x;
    y = (y < 0) ? 0 : (y >= this.h) ? this.h - 1 : y;
    return this.tiles[Math.floor(y)][Math.floor(x)];
};

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

    var tileSize = TILE_SIZE;
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
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
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

Level.prototype.update = function(dt, t) {
    if (this.waveStarted) {
        this.waves[ this.currentWave ].update(t);
    }
};

Level.prototype.spawnUnit = function(tp) {
    var tile = this.get(this.spawns[0].startX, this.spawns[0].startY);
    var e = new Enemy(tile, tp);
    this.game.enemies.push( e );
    this.game.renderSorter.add(e);
};
