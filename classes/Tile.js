
TILE_EMPTY = new TileType(null);
TILE_PATH = new TileType("rgba(0, 0, 0, 0.1)");
TILE_TARGET = new TileType("rgba(80, 80, 240, 0.5)");
TILE_SPAWN = new TileType("rgba(0, 0, 0, 0.4)");
TILE_TOWER = new TileType("rgba(120, 120, 240, 0.2)");

function TileType(color) {
    this.color = color;
}

function Tile(tx, ty, x, y) {
    this.tp = TILE_EMPTY;
    this.tower = null;
    this.tx = tx;
    this.ty = ty;
    this.x = x;
    this.y = y;
}