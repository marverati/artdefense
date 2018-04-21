
TILE_EMPTY = new TileType("Empty", null);
TILE_PATH = new TileType("Path", "rgba(0, 0, 0, 0.1)");
TILE_TARGET = new TileType("Target", "rgba(80, 80, 240, 0.5)");
TILE_SPAWN = new TileType("Spawn", "rgba(0, 0, 0, 0.4)");
TILE_GUN = new TileType("Gun", "rgba(120, 120, 240, 0.2)");

function TileType(name, color) {
    this.name = name;
    this.color = color;
}

function Tile(level, tx, ty, x, y) {
    this.level = level;
    this.tp = TILE_EMPTY;
    this.gun = null;
    this.tx = tx;
    this.ty = ty;
    this.x = x;
    this.y = y;
    this.nextTiles = [];
    this.nextCycle = 0;
}

Tile.prototype.getNextTile = function() {
    if (this.nextTiles.length < 1) {
        return this.level.targetTile;
    }
    var next = this.nextTiles[this.nextCycle];
    this.nextCycle = (this.nextCycle + 1) % this.nextTiles.length;
    return next;
};

Tile.prototype.addNextTile = function(t) {
    if (t != this) {
        this.nextTiles.push(t);
    }
};

Tile.prototype.setGun = function(gun) {
    if (this.tp == TILE_EMPTY) {
        this.gun = gun;
        this.tp = TILE_GUN;
    }
};
