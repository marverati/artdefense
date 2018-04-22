


function DeckRenderer(deck, canvas) {
    this.deck = deck;
    this.canvas = canvas;
    this.activeCard = null;
    this.hoverCard = null;
    this.cw = CardType.baseImage.width;
    this.ch = CardType.baseImage.height;
    this.cw2 = this.cw / 2;
    this.ch2 = this.ch / 2;
}

DeckRenderer.prototype.render = function(ctx) {
    // Hand Cards
    var drawn = this.deck.drawn;
    var count = drawn.length;
    var spacing = Math.min(200, 1000 / count);
    var basey = this.canvas.height / 2 + 80;
    var basex = 180 - this.canvas.width / 2;
    for (var i = 0; i < count; i++) {
        var y = basey;
        if (this.activeCard == drawn[i]) {
            y -= game.selecting ? 80 : 250;
        } else if (this.hoverCard == drawn[i]) {
            y -= 80;
        }
        this.renderCard(ctx, drawn[i], basex + spacing * i, y, 0);
    }
};

DeckRenderer.prototype.handleMouseMove = function(mx, my) {
    this.hoverCard = null;
    var drawn = this.deck.drawn;
    for (var i = drawn.length - 1; i >= 0; i--) {
        var card = drawn[i];
        var x1 = card.x - this.cw2, y1 = card.y - this.ch2;
        var x2 = x1 + this.cw, y2 = y1 + this.ch;
        if (mx >= x1 && mx <= x2 && my >= y1 && my <= y2) {
            this.hoverCard = card;
            return true;
        }
    }
};

DeckRenderer.prototype.handleMouseClick = function() {
    if (this.hoverCard != null) {
        if (this.hoverCard == this.activeCard) {
            // Play card
            this.activeCard.select();
        } else {
            // Select other card
            this.activeCard = this.hoverCard;
        }
        return true;
    } else {
        if (!game.selecting) {
            this.activeCard = null;
        }
    }
};

DeckRenderer.prototype.renderCard = function(ctx, card, x, y, a) {
    if (a == null) { a = 0; }

    // Move card around
    if (card.x == null) {
        card.x = ctx.canvas.width * 0.6 + 150;
        card.y = 200;
    }
    var f = 0.95;
    if (x != card.x) {
        card.x = f * card.x + (1-f) * x;
        if (Math.abs(card.x - x) < 0.2) { card.x = x; }
        x = card.x;
    }
    if (y != card.y) {
        card.y = f * card.y + (1-f) * y;
        if (Math.abs(card.y - y) < 0.2) { card.y = y; }
        y = card.y;
    }

    ctx.save();

    ctx.translate(x, y);
    ctx.rotate(a);

    // Card Background
    var w = CardType.baseImage.width, h = CardType.baseImage.height;
    var x1 = -w/2, y1 = -h/2;
    ctx.drawImage(CardType.baseImage, x1, y1, w, h);

    // Title
    ctx.font = Card.font;
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
