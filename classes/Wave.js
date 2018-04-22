

function Wave(count, generator) {
    this.units = [];
    for (var i = 0; i < count; i++) {
        var [time, type, props] = generator(i);
        this.units.push({ time: time * 1000, type: type, properties: props, spawned: false });
    }
    this.level = null;
}

Wave.prototype.update = function(t) {
    t -= this.startTime;
    for (var unit of this.units) {
        if (!unit.spawned && t >= unit.time) {
            unit.spawned = true;
            this.level.spawnUnit(unit.type, unit.properties);
        }
    }
};

Wave.prototype.start = function(t) {
    this.startTime = t + 5000;
};
