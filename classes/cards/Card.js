
const INTERACT = {
    NONE: 0,
    SELECT_TILE: 1,
    SELECT_GUN: 2,
    SELECT_FREE_TILE: 3,
}

function CardType(name, image, description, interactionType, executor, filter) {
    this.name = name;
    this.image = image;
    this.description = description;
    this.interactionType = interactionType;
    this.executor = executor;
    this.filter = filter;
}

function Card(tp) {
    this.type = tp;
    this.inStack = true;
    this.inHand = false;
    this.used = false;
    this.deck = null;
}

Card.prototype.select = function() {
    // Begin interaction
    // TODO
};

Card.prototype.use = function() {
    // Ultimate usage
    this.executor();
    this.inHand = false;
    this.used = true;
    this.deck.registerUse(this);
};




CardType.createBaseImage = function() {
    var cnv = CardType.baseImage = document.createElement("canvas");
    var w = cnv.width = 300;
    var h = cnv.height = 450;
    var ctx = cnv.getContext("2d");
    
    ctx.fillStyle = "#fdf4f0";
    ctx.fill();
    roundRect(32, 16);
    ctx.lineWidth = 16;
    ctx.strokeStyle = "#60241c";
    ctx.stroke();
    roundRect(32, 8);
    ctx.lineWidth = 8;
    ctx.strokeStyle = "black";
    ctx.stroke();

    function roundRect(r, off) {
        var x1 = off, y1 = off, x2 = w - off, y2 = h - off;
        ctx.beginPath();
        ctx.moveTo(x1 + r, y1);
        ctx.lineTo(x2 - r, y1);
        ctx.lineTo(x2, y1 + r);
        ctx.lineTo(x2, y2 - r);
        ctx.lineTo(x2 - r, y2);
        ctx.lineTo(x1 + r, y2);
        ctx.lineTo(x1, y2 - r);
        ctx.lineTo(x1, y1 + r);
        ctx.closePath();
    }
}
CardType.createBaseImage();