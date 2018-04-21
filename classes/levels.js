

var levels = [];


// Level 1
function createLevels(game) {

    createLevel(
        9, 9,
        7, 7,
        new Spawn(1, 1).moveDown(3).moveRight(6).moveDown(3),
        [
            new Wave(5, function (w) { return [6 * w, null]; }),
            new Wave(10, function (w) { return [5 * w, null]; })
        ]
    );
    
    // Level 2
    createLevel(
        17, 20,
        8, 18,
        new Spawn(8, 1).moveDown(4).moveRight(5).moveDown(5).moveLeft(10).moveDown(5).moveRight(5).moveDown(3),
        []
    ); 

    function createLevel(w, h, trgx, trgy, paths, waves) {
        var lvl = new Level(game, w, h, trgx, trgy, paths, waves);
        levels.push(lvl);
        return lvl;
    }   

}
