
const INTERACT = {
    NONE: 0,
    SELECT_TILE: 1,
    SELECT_GUN: 2,
    SELECT_FREE_TILE: 3,
}

function CardType(name, image, description, interactionType, executor, filter, count, displayRange) {
    this.name = name;
    this.image = image;
    this.description = Card.wrapText(description);
    this.interactionType = interactionType;
    this.executor = executor;
    this.filter = filter;
    this.count = count;
    this.displayRange = displayRange;
}

function Card(tp) {
    this.type = tp;
    this.inStack = true;
    this.inHand = false;
    this.used = false;
    this.deck = null;
}

Card.font = "24px Calibri";

Card.wrapText = function(text) {
    var ctx = (document.createElement("canvas").getContext("2d"));
    ctx.font = Card.font;
    var words = text.split(' ');
    var line = "";
    var maxWidth = 240;
    var result = [];

    for (var i = 0; i < words.length; i++) {
        var s = line + words[i] + ' ';
        var size = ctx.measureText(s);
        if (size.width > maxWidth && i > 0) {
            result.push(line);
            line = words[i] + " ";
        } else {
            line = s;
        }
    }
    if (line.length > 0) {
        result.push(line);
    }
    return result;
}

Card.prototype.select = function() {
    var self = this;
    if (this.type.interactionType == INTERACT.NONE) {
        // Card with immediate effect
        this.use();
    } else {
        // Begin interaction
        game.startSelection(function(tile) {
            // Filtering
            var result = true;
            if (self.type.interactionType == INTERACT.SELECT_GUN) {
                result = tile.gun != null;
            } else if (self.type.interactionType == INTERACT.SELECT_FREE_TILE) {
                result = tile.tp == TILE_EMPTY;
            }
            if (result && self.type.filter) {
                result = self.type.filter(tile);
            }
            return result;
        }, function(tile) {
            // Execution
            self.use(tile);
        }, function() {
            // Cancelled
        }, this.type.displayRange);
    }
};

Card.prototype.use = function(target) {
    // Ultimate usage
    if (this.type.interactionType == INTERACT.SELECT_GUN) {
        target = target.gun;
    }
    this.type.executor(target);
    this.inHand = false;
    this.used = true;
    this.deck.registerUse(this);
};




CardType.createBaseImage = function() {
    var cnv = CardType.baseImage = document.createElement("canvas");
    var w = cnv.width = 300;
    var h = cnv.height = 450;
    var ctx = cnv.getContext("2d");
    
    roundRect(32, 16);
    ctx.fillStyle = "#fdf4f0";
    ctx.fill();
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