class Audio {
    constructor(parent) {
        this.parent = parent;
        this.musicPlaying = false;
    }

    static playMusicFile(filename) {
        if (this.musicPlaying) {
            this.musicPlaying = false;
            this.currentSourceNode.stop();
        }
        let src = this.parent.audioCtx.createBufferSource();
        src.buffer = this.parent.assets.getAsset(filename);
        src.connect(this.parent.audioCtx.destination);
        src.loop = true;
        src.start();
        this.currentSourceNode = src;
        this.musicPlaying = true;
    }
    
    playSFX(filename) {
        let src = this.parent.audioCtx.createBufferSource();
        src.buffer = this.parent.assets.getAsset(filename);
        src.connect(this.parent.audioCtx.destination);
        src.loop = false;
        src.start();
    }

    changeVolumeBy(s) {
        let gainNode = this.parent.audioCtx.createGain();
        this.currentSourceNode.connect(gainNode).connect(this.parent.audioCtx.destination);
        gainNode.gain.value = s;
    }

    stopMusic() {
        this.currentSourceNode.stop();
    }

    pause() {
        this.parent.audioCtx.suspend().then(() => console.log("AudioContext suspended"));
    }

    play() {
        this.parent.audioCtx.resume().then(() => console.log("AudioContext resumed"));
    }
}