

var cardTypes = [];

// Color guns
for (var tp of [GUN_YELLOW, GUN_BLUE, GUN_GREEN, GUN_RED]) {
    addCardType(tp.name + " Tower", tp.image, "Create a new tower shooting " + tp.name.toLowerCase() + " paint.", INTERACT.SELECT_FREE_TILE, 
        function(tile) { game.guns.push(new Gun(game, tile, tp)); }, 5);
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
addCardType("Higher Frequency", null, "Pick a tower to shoot with 33% higher frequency than before.", INTERACT.SELECT_GUN, function(gun) {
    gun.delay = 0.75 * gun.delay;
}, 3);
addCardType("Higher Damage", null, "Pick a tower to deal 50% more damage than before", INTERACT.SELECT_GUN, function(gun) {
    gun.damage = 1.5 * gun.damage;
}, 3);
addCardType("Higher Range", null, "Pick a tower to increase its shot range by 33%", INTERACT.SELECT_GUN, function(gun) {
    gun.range = 1.333 * gun.range;
    gun.range2 = gun.range * gun.range;
}, 3);
addCardType("Precision", null, "Pick a tower to practically eliminate scattering and make its shots much more precise", INTERACT.SELECT_GUN, function(gun) {
    gun.scattering = 0.1 * gun.scattering;
}, 3);
addCardType("Jumping Bullets", null, "Pick a tower to let its bullets jump once to another enemy after hitting one.", INTERACT.SELECT_GUN, function(gun) {
    gun.bulletJump = true;
}, 3);
addCardType("Sprinkler", null, "Pick a tower to turn it into a sprinkler. Much increased frequency, but no targeting.", INTERACT.SELECT_GUN, function(gun) {
    gun.delay = 0.2 * gun.delay;
    gun.sprikler = true;
}, 2);
addCardType("Spray", null, "Pick a tower to shoot two additional bullets with each shot.", INTERACT.SELECT_GUN, function(gun) {
    gun.shootSpray = true;
}, 3);
addCardType("Side Shots", null, "Pick a tower to shoot two additional bullets with each shot, in 90° angles to the sides.", INTERACT.SELECT_GUN, function(gun) {
    gun.shootSides = true;
}, 2);
addCardType("Back Shot", null, "Pick a tower to shoot an additional bullet to the back with each shot.", INTERACT.SELECT_GUN, function(gun) {
    gun.shootBack = true;
}, 2);
addCardType("Life Generator", null, "Pick a tower to turn into a life generator. Every time this tower destroys an enemy, you will get a life.", INTERACT.SELECT_GUN, function(gun) {
    gun.lifeGenerator = true;
}, 2);
addCardType("Confusion", null, "Selected tower will have a 10% chance to confuse a hit enemy, who will walk backwards for a while", INTERACT.SELECT_GUN, function(gun) {
    gun.confusion = true;
});
addCardType("More Upgrades", null, "Selected tower will be able to obtain one additional upgrade", INTERACT.SELECT_GUN, function (gun) {
    gun.upgradeSlots++;
});


function addUpgrade(name, img, desc, execute, countInDeck) {
    addCardType(name, img, desc, INTERACT.SELECT_GUN, execute, countInDeck, function(gun) {
        return gun.upgrades < gun.upgradeSlots;
    });
}

function addCardType(name, img, desc, interact, execute, countInDeck, filter) {
    var tp = new CardType(name, img, desc, interact, execute, filter);
    cardTypes.push(tp);
}