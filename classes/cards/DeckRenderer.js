


function DeckRenderer(deck, canvas) {
    this.deck = deck;
    this.canvas = canvas;
}

DeckRenderer.prototype.render = function(ctx) {
    // Hand Cards
    var drawn = this.deck.drawn;
    var count = drawn.length;
    var spacing = Math.min(200, 800 / count);
    var basey = this.canvas.height / 2 + 80;
    var basex = 180 - this.canvas.width / 2;
    console.log(spacing);
    for (var i = 0; i < count; i++) {
        this.renderCard(ctx, drawn[i], basex + spacing * i, basey, 0);
    }
};


DeckRenderer.prototype.renderCard = function(ctx, card, x, y, a) {
    if (a == null) { a = 0; }
    ctx.save();

    ctx.translate(x, y);
    ctx.rotate(a);

    // Card Background
    var w = CardType.baseImage.width, h = CardType.baseImage.height;
    var x1 = -w/2, y1 = -h/2;
    ctx.drawImage(CardType.baseImage, x1, y1, w, h);

    // Title
    ctx.font = "24px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(card.type.name, x1 + 56, y1 + 55);

    // Image
    if (card.type.image) {
        ctx.drawImage(card.type.image, -40, y1 + 90, 80, 80);
    }

    // Description
    var ty = y1 + (card.type.image != null ? 190 : 110);
    for (var i = 0; i < card.type.description.length; i++) {
        ctx.fillText(card.type.description[i], x1 + 36, ty);
        ty += 32;
    }

    ctx.restore();
};
