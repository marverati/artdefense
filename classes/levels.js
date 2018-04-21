

var levels = [];


// Level 1
createLevel(
    17, 20,
    8, 18,
    new Spawn(8, 1).moveDown(4).moveRight(5).moveDown(5).moveLeft(10).moveDown(5).moveRight(5).moveDown(3)
);






function createLevel(w, h, trgx, trgy, paths) {
    var lvl = new Level(w, h, trgx, trgy, paths);
    levels.push(lvl);
    return lvl;
}