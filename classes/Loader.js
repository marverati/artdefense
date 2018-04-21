

function Loader(displayDiv, finishCallback) {
    this.div = displayDiv;
    this.mediaCount = 0;
    this.processedCount = 0;
    this.loadedCount = 0;
    this.errorCount = 0;
    this.media = [];
    this.finishCallback = finishCallback;
    this.allowFinish = false;
    this.ready = false;
}

Loader.prototype.checkFinish = function() {
    if (this.allowFinish) {
        if (this.processedCount >= this.mediaCount) {
            this.allowFinish = false;
            if (this.finishCallback) {
                if (typeof this.div == "string") {
                    this.div = document.getElementById(this.div);
                }
                this.div.style.display = "none";
                this.ready = true;
                this.finishCallback();
            }
        }
    }
};

Loader.prototype.loadImage = function(src) {
    var self = this;
    var img = new Image();
    this.media.push(img);
    this.mediaCount++;
    img.onerror = function(e) {
        self.errorCount++;
        self.processedCount++;
        console.error("Could not load image 'src': " + e.toString());
    };
    img.onload = function() {
        self.loadedCount++;
        self.processedCount++;
        self.checkFinish();
    };
    img.src = src;
    return img;
};

Loader.prototype.beginLoading = function() {
    this.allowFinish = true;
    this.checkFinish();
};

Loader.prototype.finishImage = function(img) {
    if (img.width > 0) {
        return Promise.resolve();
    } else {
        return new Promise(function(resolve, reject) {
            img.addEventListener("load", handleImage, this);
            img.addEventListener("error", handleError, this);

            function handleImage() {
                img.removeEventListener("load", handleImage, this);
                resolve();
            }

            function handleError(e) {
                img.removeEventListener("error", handleError, this);
                reject(e);
            }
        });
    }
};
