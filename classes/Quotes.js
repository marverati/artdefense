

var quotes = [
    "All is fair in art and war.",
    "Where there's Art, there is Violence.",
    "The good artists paints. The great artist uses the force.",
    "Paintings are the window to the soul.",
    "Put a Smile on that Canvas",
    "When the color is right, the art is tight.",
    "Paint it. Print it. Put in on the wall.",
    "Raiders of the lost Art",
    "Paint today, and reap the rewards for a lifetime",
    "Quotes too are a form of art",
    "Where there's paint, there's life",
    "The grande finale"
];

var prevQuote = -1;
var quoteStartTime = 0;

function drawQuote(ctx, id, x, y) {
    if (id != prevQuote) {
        prevQuote = id;
        quoteStartTime = game.tAbs;
    }
    var tdif = game.tAbs - quoteStartTime;
    var tmax = 16000;
    var fadeTime = 4000;
    if (tdif < tmax && id >= 0 && id < quotes.length) {
        var alpha = 1;
        if (tdif < fadeTime) { alpha = tdif / fadeTime; }
        if (tdif > tmax - fadeTime) { alpha = (tmax - tdif) / fadeTime; }
        if (alpha > 0) {
            ctx.globalAlpha = alpha;
            ctx.fillStyle = "#666";
            ctx.fillText("Act " + (id + 1), x, y - TILE_SIZE);
            ctx.fillText(quotes[id], x, y);
            ctx.globalAlpha = 1;
        }
    }
}