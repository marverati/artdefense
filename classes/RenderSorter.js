

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
        this.elements[i].render(ctx, camera);
    }

    function project(element) {
        return element.y - element.x;
    }
};
