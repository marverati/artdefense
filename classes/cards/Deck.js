

function Deck() {
    this.cards = [];
    this.stack = [];
    this.drawn = [];
    this.used = [];
}

Deck.prototype.addCard = function(card) {
    this.cards.push(card);
    this.stack.unshift(card);
    card.deck = this;
};

Deck.prototype.shuffleStack = function() {
    // Shuffle stack
    for (var i = 1; i < this.stack.length; i++) {
        var j = Math.floor(Math.random() * (i + 1));
        if (i != j) {
            var temp = this.stack[i];
            this.stack[i] = this.stack[j];
            this.stack[j] = temp;
        }
    }
};

Deck.prototype.drawCard = function() {
    if (this.stack.length > 0) {
        var card = this.stack.pop();
        this.drawn.push(card);
        card.inStack = false;
        card.inHand = true;
    }
};

Deck.prototype.registerUse = function(card) {
    var i = this.drawn.indexOf(card);
    if (i >= 0) {
        this.drawn.splice(i, 1);
    }
    this.used.push(card);
};

Deck.prototype.drawCards = function(count) {
    for (var i = 0; i < count; i++) {
        this.drawCard();
    }
};

Deck.prototype.resetStack = function() {
    this.stack = this.stack.concat(this.drawn).concat(this.used);
    this.drawn = [];
    this.used = [];
    this.cards.forEach(function(card) {
        card.inStack = true;
        card.inHand = false;
        card.used = false;
    });
};  
