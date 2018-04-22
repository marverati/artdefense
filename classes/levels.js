

var levels = [];


// Level 1
function createLevels(game) {

    createLevel(
        23, 17,
        2, 13,
        new Spawn(2, 2).moveDown(8).moveRight(7).moveUp(4).moveLeft(3).moveUp(4).
        moveRight(10).moveDown(4).moveLeft(3).moveDown(4).moveRight(4).moveUp(3).
        moveRight(3).moveDown(6).moveLeft(6).moveUp(1).moveLeft(2).moveDown(2).moveLeft(2).
        moveUp(2).moveLeft(2).moveDown(1).moveLeft(5),
        [
            new Wave(3, function (w) { return [6 * w, TYPE_BLANC, { hp: 80 }]; }),
            new Wave(6, function (w) { return [4 * w, TYPE_BLANC, { hp: 120 }]; }),
            new Wave(9, function(w) { return [2 * w, TYPE_BLANC, { hp: 120, rotationType: ROTATION.SPINNING }] }), 
            new Wave(8, function(w) { return [3.2 * w, w % 2 ? TYPE_BLANC : GUN_BLUE, { hp: 190, width: 140} ]}),
            new Wave(12, function(w) { return [1.2 * w, GUN_RED, { hp: 85, rotationType: ROTATION.SIDEWAYS }]}),
            new Wave(6, function(w) { return [5 * w, w % 2 ? GUN_BLUE : GUN_GREEN, { speed: 0.25, hp: 200 }]}), 
            new Wave(10, function(w) { return [4 * w - 3 * (w % 2), GUN_YELLOW, { hp: 360 }]}),
            new Wave(32, function(w) { return [2 * w, TYPE_BLANC, { hp: 105, height: 70, speed: 0.18, rotationType: w % 2 ? ROTATION.DEFAULT : ROTATION.SIDEWAYS }]}),
            new Wave(2, function(w) { return [8 * w, GUN_RED, { hp: 1600, rotationType: ROTATION.OSCILLATING, speed: 0.12, lives: 3 }]}),
            new Wave(12, function(w) { return [0.5 * w, GUN_BLUE, { hp: 240, width: 120, height: 60}]}),
            new Wave(24, function(w) { return [
                3 * w + Math.random() * 2,
                [GUN_BLUE, GUN_RED, GUN_YELLOW, GUN_GREEN, TYPE_BLANC][Math.floor(Math.random() * 5)],
                { hp: 400, width: 80 + 20 * rnd(), height: 80 + 20 * rnd(), 
                    rotationType: Math.floor(Math.random() * 4) }
            ]}),
            new Wave(1, function(w) { return [w, TYPE_BLANC, { hp: 4000, speed: 0.08, width: 160, height: 220, lives: 5, immune: true }]})
        ]
    );

    // Simple
    createLevel(
        9, 9,
        7, 7,
        new Spawn(2, 1).moveDown(6).moveRight(3).moveUp(6).moveRight(3).moveDown(6),
        [
            new Wave(3, function (w) { return [6 * w, TYPE_BLANC, {}]; }),
            new Wave(6, function (w) { return [4 * w, TYPE_BLANC]; }),
            new Wave(9, function(w) { return [2 * w, TYPE_BLANC, { maxHp: 100, rotationType: ROTATION.SPINNING }] }), 
            new Wave(8, function(w) { return [3.2 * w, w % 2 ? TYPE_BLANC : GUN_BLUE, { hp: 160, width: 140} ]}),
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
