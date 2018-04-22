

function RenderSorter() {
    this.elements = [];
}

RenderSorter.prototype.add = function(e) {
    this.elements.push(e);
};

RenderSorter.prototype.remove = function(e) {
    var i = this.elements.indexOf(e);
    if (i >= 0) {
        this.elements.splice(i, 1);
    }
};

RenderSorter.prototype.render = function(ctx, camera) {
    // Sort
    this.elements.sort(function(a, b) {
        return project(a) - project(b);
    });

    // Remove duplicates
    for (var i = this.elements.length - 1; i >= 1; i--) {
        if (this.elements[i] == this.elements[i - 1]) {
            this.elements.splice(i);
        }
    }

    // Render
    for (i = 0; i < this.elements.length; i++) {
        // Dead enemies
        if (this.elements[i] instanceof Enemy) {
            if (!this.elements[i].alive) {
                if (this.elements[i].hp <= 0) {
                    // Killed
                    var alpha = 1 - (game.tAbs - this.elements[i].deathTime) * 0.002;
                    if (alpha <= 0) { this.elements.splice(i, 1); i--; continue; }
                    ctx.globalAlpha = alpha;
                } else {
                    // Reached target
                    this.elements[i].h = this.elements[i].deathHeight + Math.pow((game.tAbs - this.elements[i].deathTime) / 50, 2);
                    if (this.elements[i].h > 10000) { this.elements.splice(i, 1); i--; continue; }
                }
                this.elements[i].render(ctx, camera);
                ctx.globalAlpha = 1;
                continue;
            }
        }
        this.elements[i].render(ctx, camera);
    }

    function project(element) {
        return element.y - element.x;
    }
};
