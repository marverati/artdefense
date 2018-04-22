
var loadingDiv = document.createElement("div");
loadingDiv.className = "loadingDiv";
loadingDiv.innerHTML = "Loading...";
window.onload = function() {
    document.body.appendChild(loadingDiv);
};

loader = new Loader(loadingDiv, function() {
    loadingDiv.display = "none";
    game = new Game(document.getElementById("gameCanvas"));
    game.loadLevel(levels[0]);
});

setTimeout(function() {
    loader.beginLoading();
}, 500);

function rnd() {
    return Math.random() - Math.random();
}

var audioMap = {};

function playSound(name) {
    var audio = audioMap[name];
    if (audio == null) {
        audio = document.getElementById(name);
        audioMap[name] = audio;
    }
    if (audio) {
        audio.currentTime = 0;
        audio.play();
    }
}