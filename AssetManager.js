class AssetManager {
    constructor(parent) {
        this.queue = [];
        this.successCount = 0;
        this.results = {};
        this.parent = parent;
        this.onLoad = null;
    }

    loadAll() {
        if (this.onLoad == null) {
            throw new Error("AssetManager: callback not set");
        }
        let that = this;
        that.numFiles = that.queue.length;
        for (let x of this.queue) {
            fetch(x.url, {
                method: 'GET'
            }).then((res) => {
                if (res.ok) {
                    if (x.type === 'img') {
                        res.blob().then((result) => {
                            createImageBitmap(result).then((imgBitmap) => {
                                that.results[x.name] = imgBitmap;
                            })
                        }).then(function() {
                            that.successCount++;
                            if (that.isDone()) {
                                that.onLoad();
                            }
                        });
                    } else if (x.type === 'audio') {
                        res.arrayBuffer().then(buffer => this.parent.audioCtx.decodeAudioData(buffer)).then(decodedData => {
                            that.results[x.name] = decodedData;
                        }).then(function() {
                            that.successCount++;
                            if (that.isDone()) {
                                that.onLoad();
                            }
                        });
                    } else {
                        res.text().then((result) => {
                            that.results[x.name] = result;
                        }).then(function() {
                            that.successCount++;
                            if (that.isDone()) {
                                that.onLoad();
                            }
                        });
                    }
                }
                that.queue.remove(x);
            });
        }
    }

    queueItems(arr) { // array of file objects
        for (let x of arr) {
            if (!this.queue.includes(x))
                this.queue.push(x);



        }
    }

    isDone() {
        return (this.numFiles == this.successCount);
    }

    getAsset(name) {
        return this.results[name]
    }
}

class FileInfo {
    constructor(name, url, type) {
        this.name = name;
        this.url = url;
        this.type = type;
    }
}