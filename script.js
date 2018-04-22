
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