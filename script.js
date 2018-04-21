

window.onload = function() {
    game = new Game(document.getElementById("gameCanvas"));
    game.loadLevel(levels[0]);
};

function rnd() {
    return Math.random() - Math.random();
}