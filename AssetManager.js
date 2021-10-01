class AssetManager {
    constructor(parent) {
        this.queue = [];
        this.successCount = 0;
        this.results = {};
        this.parent = parent;
        this.onload = null;
    }

    handleData(item, res) {
        if (!res.ok) throw new Error(`Loading asset ${item.name} failed.`);

        const store = (value) => this.results[item.name] = value;

        const onsuccess = () => {
            this.successCount += 1;
            if (this.isDone()) this.onload();
        }

        const transformer = {
            img: { initial: 'blob', final: (result) => createImageBitmap(result) },
            audio: { initial: 'arrayBuffer', final: (result) => this.parent.audioCtx.decodeAudioData(result) },
            txt: { initial: 'text', final: (result) => result }
        }[item.type];

        res[transformer.initial]().then(transformer.final).then(store).then(onsuccess);
    }

    loadAll() {
        if (this.onload === null) throw new Error("AssetManager: callback not set");
        this.numFiles = this.queue.length;
        this.queue.forEach((elem, idx) => fetch(elem.url).then(res => {
            this.handleData(elem, res);
            this.queue.splice(idx, 1);
        }));
    }

    queueItem(item) {
        if (!this.queue.includes(item)) this.queue.push(item);
    }

    queueItems(arr) {
        arr.forEach((elem) => this.queueItem(elem));
    }

    isDone() {
        return (this.numFiles === this.successCount);
    }

    getAsset(name) {
        return this.results[name]
    }
}