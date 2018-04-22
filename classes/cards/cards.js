

var cardTypes = [];

// Color guns
for (var tp of [GUN_YELLOW, GUN_BLUE, GUN_GREEN, GUN_RED]) {
    addIt(tp);
    function addIt(tp) {
        addCardType(tp.name + " Tower", tp.image, "Create a new tower shooting " + tp.name.toLowerCase() + " paint.", INTERACT.SELECT_FREE_TILE, 
            function(tile) { game.addGun(new Gun(game, tile, tp)); }, 5);
    }
}
// Gain Lives
addCardType("Extra Lives", null, "Gain 5 extra lives instantly.", INTERACT.NONE, function() {
    game.lives += 5;
}, 3);
// Draw 3 Cards
addCardType("Draw Cards", null, "Draw 3 new cards from the deck.", INTERACT.NONE, function() {
    game.deck.drawCards(3);
}, 5);
// Special Rainbow Tower?
addCardType("Mystery Tower", null, "Create a fancy colorful tower shooting all the colors.", INTERACT.SELECT_FREE_TILE, function(tile) {
    game.guns.push(new Gun(game, tile, GUN_RED));
}, 1);
// Improving Tower Attributes
addUpgrade("Higher Frequency", null, "Pick a tower to shoot with 33% higher frequency than before.", function(gun) {
    gun.delay = 0.75 * gun.delay;
}, 3);
addUpgrade("Higher Damage", null, "Pick a tower to deal 50% more damage than before", function(gun) {
    gun.damage = 1.5 * gun.damage;
}, 3);
addUpgrade("Higher Range", null, "Pick a tower to increase its shot range by 33%", function(gun) {
    gun.range = 1.333 * gun.range;
    gun.range2 = gun.range * gun.range;
}, 3);
addUpgrade("Precision", null, "Pick a tower to practically eliminate scattering and make its shots much more precise", function(gun) {
    gun.scattering = 0.1 * gun.scattering;
}, 3);
addUpgrade("Jumping Bullets", null, "Pick a tower to let its bullets jump once to another enemy after hitting one.", function(gun) {
    gun.bulletJump = true;
}, 3);
addUpgrade("Sprinkler", null, "Pick a tower to turn it into a sprinkler. Much increased frequency, but no targeting.", function(gun) {
    gun.delay = 0.2 * gun.delay;
    gun.sprinkler = true;
}, 2);
addUpgrade("Spray", null, "Pick a tower to shoot two additional bullets with each shot.", function(gun) {
    gun.shootSpray = true;
}, 3);
addUpgrade("Side Shots", null, "Pick a tower to shoot two additional bullets with each shot, in 90° angles to the sides.", function(gun) {
    gun.shootSides = true;
}, 2);
addUpgrade("Back Shot", null, "Pick a tower to shoot an additional bullet to the back with each shot.", function(gun) {
    gun.shootBack = true;
}, 2);
addUpgrade("Life Generator", null, "Pick a tower to turn into a life generator. Every time this tower destroys an enemy, you will get a life.", function(gun) {
    gun.lifeGenerator = true;
}, 2);
addUpgrade("Confusion", null, "Selected tower will have a 10% chance to confuse a hit enemy, who will walk backwards for a while", function(gun) {
    gun.confusion = true;
}, 2);
addCardType("More Upgrades", null, "Selected tower will be able to obtain one additional upgrade", INTERACT.SELECT_GUN, function (gun) {
    gun.upgradeSlots++;
}, 12);


function addUpgrade(name, img, desc, execute, countInDeck) {
    function wrappedExecute(gun) {
        gun.upgrades++;
        execute(gun);
    }
    addCardType(name, img, desc, INTERACT.SELECT_GUN, wrappedExecute, countInDeck, function(tile) {
        return tile.gun && tile.gun.upgrades < tile.gun.upgradeSlots;
    });
}

function addCardType(name, img, desc, interact, execute, countInDeck, filter) {
    var tp = new CardType(name, img, desc, interact, execute, filter, countInDeck);
    cardTypes.push(tp);
}