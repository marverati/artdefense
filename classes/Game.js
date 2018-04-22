
const GAME_MAX_TD = 100;

function Game(canvas) {
    this.level = null;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.levelCanvas = document.createElement("canvas");
    this.groundCanvas = document.createElement("canvas");
    this.camera = new Camera();
    this.renderSorter = new RenderSorter();
    this.paused = false;
    this.won = false;
    this.lost = false;

    shadowImage = loader.loadImage("img/shadow.png");

    this.selecting = false;
    this.selectionFilter = null;
    this.selectionCallback = null;
    this.selectionCancelCallback = null;
    this.selectionRange = null;

    this.initializeDeck();
    
    this.lives = 10;

    this.gameSpeed = 1;

    this.guns = [];
    this.enemies = [];

    createLevels(this);

    this.initializeControls();

    this.tPrev = Date.now();
    this.tAbs = 0;
    this.update();
}

Game.prototype.loadLevel = function(level) {
    this.level = level;
    this.level.renderToCanvas(this.levelCanvas);
    this.groundCanvas.width = this.levelCanvas.width;
    this.groundCanvas.height = this.levelCanvas.height;
    this.groundContext = this.groundCanvas.getContext("2d");

    this.bullets = [];
    this.enemies = [];
    this.guns = [ 
        /* new Gun(this, this.level.get(4, 5), GUN_GREEN),
        new Gun(this, this.level.get(7, 3), GUN_YELLOW),
        new Gun(this, this.level.get(2, 5), GUN_BLUE),
        // new Gun(this, this.level.get(9, 4), GUN_RED) */
    ];
    var self = this;
    this.guns.forEach(function(gun) { self.renderSorter.add(gun); });

    this.prepareDeck();

    this.camera.setPos( this.level.w / 2 * TILE_SIZE, this.level.h / 2 * TILE_SIZE);
    this.render();
};

    Game.prototype.initializeDeck = function() {
        this.deck = new Deck();
        var self = this;
        cardTypes.forEach(function(tp) {
            var count = tp.count;
            for (var i = 0; i < count; i++) {
                var card = new Card(tp);
                self.deck.addCard(card);
            }
        });
        this.deckRenderer = new DeckRenderer(this.deck, this.canvas);
    };

    Game.prototype.prepareDeck = function() {
        this.deck.resetStack();
        this.deck.shuffleStack();
        this.deck.drawSpecificCards(function(tp) {
            return tp.name.indexOf(" Tower") >= 0 && tp.name.indexOf("Mystery") < 0;
        }, 3);
        this.deck.drawSpecificCards(function(tp) {
            return tp.name.indexOf("Jump") >= 0;
        });
        this.deck.shuffleStack();
        this.deck.drawCards(5 - this.deck.drawn.length);
    };

Game.prototype.update = function() {
    if (this.level) {
        this.updateControls();
        this.updateLogic();
        this.render();
    }

    requestAnimationFrame(this.update.bind(this));
};

Game.prototype.updateControls = function() {

};

Game.prototype.updateLogic = function() {
    if (this.paused) {
        return;
    }

    // Timing
    var t = Date.now();
    var dt = (t - this.tPrev);
    if (dt > GAME_MAX_TD) { dt = GAME_MAX_TD; }
    dt = this.gameSpeed * dt;
    this.tAbs += dt;
    this.tPrev = t;

    // Level and spawning
    this.level.update(dt, this.tAbs);
    // Enemy movement
    var finished = [];
    for (var e of this.enemies) {
        var done = e.update(dt, this.tAbs);
        if (done) {
            finished.push(e);
        }
    }
    for (var e of finished) {
        this.handleFinishedEnemy(e);
    }
    // Guns
    for (var g of this.guns) {
        g.update(dt, this.tAbs);
    }
    // Bullets
    for (var b = this.bullets.length - 1; b >= 0; b--) {
        var done = this.bullets[b].update(dt, this.tAbs);
        if (done) {
            this.renderSorter.remove(this.bullets[b]);
            var e = this.bullets[b].hitEnemy;
            if (this.bullets[b].h <= 0) {
                renderCanvasSplash(this.groundContext, this.bullets[b].gun.tp.splash, this.bullets[b].x, this.bullets[b].y, 0.25);
            }
            if (e) {
                // Enemy was hit
                if (e.alive == false) {
                    if (this.bullets[b].gun.lifeGenerator) {
                        this.lives++;
                    }
                }
            }
            this.bullets.splice(b, 1);
        }
    }
};

    Game.prototype.handleFinishedEnemy = function(e) {
        var i = this.enemies.indexOf(e);
        if (i >= 0) {
            this.level.handleEnemyDeath(e);
            if (e.alive) {
                // When enemy is still alive while being destroyed, it reached the target; otherwise killed by bullet
                e.alive = false;
                this.lives--;
                if (this.lives <= 0) {
                    // Lost the game
                    this.lost = true;
                    this.deck.handleDefeat();
                    // Remove all guns
                    for (var gun of this.guns) {
                        this.renderSorter.remove(gun);
                    }
                    this.guns = [];
                } else {
                    this.deck.drawCards(this.lives <= 2 ? 3 : this.lives <= 5 ? 2 : 1);
                }
            }
            this.renderSorter.remove(this.enemies[i]);
            this.enemies.splice(i, 1);
        }
    }

Game.prototype.render = function() {
    // Clear
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = "white";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Isometry
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.save();
    this.camera.applyTransform(this.ctx);

    // Level Paint
    this.ctx.drawImage(this.groundCanvas, 0, 0);

    // Level Geometry
    this.ctx.drawImage(this.levelCanvas, 0, 0);

    // Spawn Decoration
    if (!this.won && !this.lost) {
        if (this.level.waveStarted) {
            // Wave Progress
            var remaining = this.level.enemyCount - this.level.passedEnemies - this.enemies.length;
            if (remaining > 0) {
                this.ctx.fillStyle = "white";
                this.ctx.font = "86px Calibri";
                this.ctx.textAlign = "center";
                this.ctx.fillText("" + remaining, this.level.spawns[0].startX * TILE_SIZE + 48, this.level.spawns[0].startY * TILE_SIZE + 80);
                this.ctx.textAlign = "left";
            }
        } else {
            // Spawn Direction
            var x = (this.level.spawns[0].startX + 0.5) * TILE_SIZE;
            var y = (this.level.spawns[0].startY + 0.5) * TILE_SIZE + 10 * Math.sin(this.tAbs * 0.003);
            this.ctx.save();
            this.ctx.globalAlpha = 0.5;
            this.ctx.translate(x, y);
            this.ctx.scale(1, -1);
            this.ctx.drawImage(Gun.upgradeSlotImage, -40, -40, 80, 80);
            this.ctx.restore();
        }
    }

    // Hover Effect
    if (this.selecting) {
        if (this.mouseTile != null) {
            this.renderHover(this.mouseTileX, this.mouseTileY, this.selectionPossible);
        }
    }

    // Range
    if (this.selecting && this.selectionRange) {
        this.ctx.strokeStyle = "#30ff30";
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc((this.mouseTileX + 0.5) * TILE_SIZE, (this.mouseTileY + 0.5) * TILE_SIZE, this.selectionRange, 0, 6.29);
        this.ctx.closePath();
        this.ctx.stroke();
    }

    this.ctx.restore();

    // Canvases, Guns and Bullets
    this.renderSorter.render(this.ctx, this.camera);

    // Cards
    if (this.selecting) {
        this.ctx.globalAlpha = 0.25;
    }
    this.deckRenderer.render(this.ctx);
    this.ctx.globalAlpha = 1;

    // Lives
    if (!this.lost) {
        this.ctx.fillStyle = "black";
        this.ctx.font = "42px Calibri";
        this.ctx.fillText("Lives: " + this.lives, -this.canvas.width / 2 + 20, -this.canvas.height / 2 + 50);
    }

    // Start Wave
    if (!this.level.waveStarted && !this.won && !this.lost) {
        this.ctx.textAlign = "center";
        this.ctx.font = "42px Calibri";
        this.ctx.fillStyle = "#c0c0c0";
        var y = -300 + 25 * Math.sin(0.001 * Date.now());
        this.ctx.fillText("Press Enter when you're ready for wave " + (1 + this.level.currentWave) + " / " + this.level.waves.length, 0, y);
    }

    // Won
    if (this.won && !this.lost) {
        this.ctx.textAlign = "center";
        this.ctx.font = "80px Calibri";
        this.ctx.fillStyle = "#d4a030";
        var y = -200 + 50 * Math.sin(0.001 * Date.now());
        this.ctx.fillText("You did it \\o/  Thanks for playing!", 0, y);
    }

    // Lost
    if (this.lost) {
        this.ctx.textAlign = "center";
        this.ctx.font = "80px Calibri";
        this.ctx.fillStyle = "#600802";
        var y = -200 + 50 * Math.sin(0.001 * Date.now() + Math.PI);
        this.ctx.fillText("GAME OVER", 0, y);
    }
    this.ctx.textAlign = "left";
};

    Game.prototype.renderHover = function(tx, ty, colorOrValid) {
        var color = colorOrValid;
        if (typeof colorOrValid == "boolean") {
            color = colorOrValid ? "rgba(0,255,0,0.3)" : "rgba(255,0,0,0.3)";
        }
        this.ctx.fillStyle = color;
        this.ctx.fillRect(tx * TILE_SIZE, ty * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

Game.prototype.initializeControls = function() {
    document.body.addEventListener("keydown", this.handleKey.bind(this));
    this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("click", this.handleMouseClick.bind(this));
    this.canvas.addEventListener("contextmenu", this.handleRightClick.bind(this));
};

Game.prototype.handleKey = function(e) {
    var rl = (e.key == "ArrowRight" ? 1 : 0) - (e.key == "ArrowLeft" ? 1 : 0);
    var ud = (e.key == "ArrowDown" ? 1 : 0) - (e.key == "ArrowUp" ? 1 : 0);
    if (rl || ud) {
        var dx = 32 * (ud * this.camera.sin + rl * this.camera.cos);
        var dy = 32 * (ud * this.camera.cos - rl * this.camera.sin);
        this.camera.move(dx, dy);
    }
    if (e.key == "p") {
        this.paused = !this.paused;
    }
    if (e.key == "Enter") {
        this.level.handleEnterKey(this.tAbs);
    }
};


function drawShadow(ctx, x, y, scale, fade) {
    if (shadowImage) {
        ctx.save();
        ctx.translate(x, y);
        if (fade != null) { ctx.globalAlpha *= fade; }
        var sc = (scale == null) ? 1 : scale;
        ctx.scale(sc, sc);
        ctx.drawImage(shadowImage, -shadowImage.width / 2, -shadowImage.height / 2);
        ctx.restore();
    }
}

Game.prototype.startSelection = function(filter, callback, cancelCallback, displayRange) {
    if (this.selecting) {
        this.cancelSelection();
    }
    this.selecting = true;
    this.selectionFilter = filter || function(tile) { return tile != null; };
    this.selectionCallback = callback || function(tile) {};
    this.selectionCancelCallback = cancelCallback || function() {};
    this.selectionRange = displayRange;
};

Game.prototype.cancelSelection = function() {
    if (this.selecting) {
        this.selecting = false;
        this.selectionCancelCallback();
        this.selectionFilter = null;
        this.selectionCallback = null;
        this.selectionCancelCallback = null;
    }
};

Game.prototype.updateSelection = function() {
    var tile = this.mouseTile;
    if (tile != null) {
        this.selectionTile = tile;
        this.selectionPossible = this.selectionFilter(tile);
    }
};

Game.prototype.handleMouseMove = function(e) {
    var mx = this.mouseX = (e.clientX - this.canvas.offsetLeft) * this.canvas.width / this.canvas.offsetWidth;
    var my = this.mouseY = (e.clientY - this.canvas.offsetTop) * this.canvas.height / this.canvas.offsetHeight;
    if (this.deckRenderer.handleMouseMove(mx - this.canvas.width / 2, my - this.canvas.height / 2)) {
        this.mouseTileX = this.mouseTileY = 0;
        this.mouseTile = null;
    }
    [absmx, absmy] = this.camera.detransform(this.canvas, mx, my);
    this.mouseTileX = Math.floor(absmx / TILE_SIZE);
    this.mouseTileY = Math.floor(absmy / TILE_SIZE);
    this.mouseTile = this.level.get(this.mouseTileX, this.mouseTileY);
    if (this.mouseTile.tx != this.mouseTileX || this.mouseTile.ty != this.mouseTileY) {
        this.mouseTile = null;
    }
    if (this.selecting) {
        this.updateSelection();
    }
};

Game.prototype.handleMouseClick = function(e) {
    if (this.deckRenderer.handleMouseClick(this.mouseX - this.canvas.width / 2, this.mouseY - this.canvas.height / 2)) {
        return;
    }
    if (this.selecting) {
        if (e.button == 0 && this.mouseTile != null) {
            // Left click
            if (this.selectionPossible) {
                this.selectionCallback(this.selectionTile);
                this.selecting = false;
                this.selectionFilter = null;
                this.selectionCallback = null;
                this.selectionCancelCallback = null;
            }
        } else {
            // Right click
            this.cancelSelection();
        }
    }
};

Game.prototype.handleRightClick = function(e) {
    this.cancelSelection();
    e.preventDefault();
    e.stopPropagation();
}

Game.prototype.addGun = function(gun) {
    this.guns.push(gun);
    this.renderSorter.add(gun);
};
