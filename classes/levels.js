

var levels = [];


// Level 1
function createLevels(game) {

    createLevel(
        9, 9,
        7, 7,
        new Spawn(1, 1).moveDown(6).moveRight(3).moveUp(6).moveRight(3).moveDown(6),
        [
            new Wave(3, function (w) { return [6 * w, TYPE_BLANC, {}]; }),
            // new Wave(6, function (w) { return [4 * w, TYPE_BLANC]; }),
            // new Wave(9, function(w) { return [2 * w, TYPE_BLANC, { maxHp: 100, rotationType: ROTATION.SPINNING }] }), 
            // new Wave(8, function(w) { return [3.2 * w, w % 2 ? TYPE_BLANC : GUN_BLUE, { hp: 160, width: 140} ]}),
            new Wave(12, function(w) { return [1.2 * w, GUN_RED, { hp: 65, rotationType: ROTATION.SIDEWAYS }]})
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
