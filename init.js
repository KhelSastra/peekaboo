window.onload = init;
const MIN_ASPECT_RATIO = 1.2;
const CANVAS_SIZE = 1080;

const ASSETS = [{
        name: 'script',
        url: '/assets/txt/script.json',
        type: 'txt'
    },
    {
        name: 'posns',
        url: '/assets/txt/ImagePositions.txt',
        type: 'txt'
    },
    {
        name: 'scene1Bg',
        url: '/assets/img/GangesTest.jpeg',
        type: 'img'
    },
    {
        name: 'testAudio',
        url: '/assets/audio/TestAudio.m4a',
        type: 'audio'
    }
]

class Peekaboo {
    constructor(selector) {
        this.started = false;
        this.debug = false;
        this.mouse = {
            x: 0,
            y: 0,
            left: false,
            right: false
        }

        this.actualSize = {
            width: CANVAS_SIZE,
            height: CANVAS_SIZE
        }

        this.canvas = document.querySelector(selector);
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = CANVAS_SIZE;
        this.canvas.height = CANVAS_SIZE;

        this.canvas.addEventListener('mousemove', (e) => {
            this.onMouseMove(e);
        });

        this.updateActualSize();

        this.audioCtx = new AudioContext();

        this.assets = new AssetManager(this, () => {
            this.onLoad();
        });
        this.assets.queueItems(ASSETS);
    }

    updateActualSize() {
        let style = window.getComputedStyle(this.canvas);
        this.actualSize.width = parseInt(style.width);
        this.actualSize.height = parseInt(style.height);
    }

    onLoad() {
        console.log('Finished loading assets.');
        this.begin();
    }

    onMouseMove(e) {
        let rect = this.canvas.getBoundingClientRect();
        this.mouse.x = Math.round(((e.clientX - rect.left) / this.actualSize.width) * CANVAS_SIZE); // scale mouse x to be between 0 and CANVAS_SIZE
        this.mouse.y = Math.round(((e.clientY - rect.top) / this.actualSize.height) * CANVAS_SIZE); // scale mouse y to be between 0 and CANVAS_SIZE

        this.imgMousePos = Boolean(this.currentImage) ? {
            x: Math.round(this.mouse.x / CANVAS_SIZE * this.currentImage.width),
            y: Math.round(this.mouse.y / CANVAS_SIZE * this.currentImage.height)
        } : null;
        if (this.debug) {
            console.log(this.imgMousePos)
        }
    }

    getImgHoverPos() {
        return this.imgMousePos;
    }

    getMousePos() {
        return {
            x: this.mouse.x,
            y: this.mouse.y
        };
    }

    begin() {
        this.started = true;
        this.script = JSON.parse(this.assets.getAsset('script'));
        let first = this.script['0'];
        this.setCurrentImage(first.background);
    }

    setCurrentImage(name) {
        let img = this.assets.getAsset(name);
        this.ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, this.canvas.width, this.canvas.height);
        this.currentImage = img;
    }
}

function onGameLoad() {
    console.log('Finished loading assets.');

    // setTimeout(() => {

    Game.canvasCurrentImage = img;
    Game.ctx.drawImage(img, 0, 0, img.width, img.height,
        0, 0, Game.canvas.width, Game.canvas.height);
    // }, 100);
}

function isAspectTooNarrow() {
    return (window.innerWidth / window.innerHeight) < MIN_ASPECT_RATIO;
}

Array.prototype.remove = function(v) {
    let idx = this.indexOf(v);
    if (idx != -1) {
        this.splice(idx, 1);
        return true;
    }
    return false;
}

function init() {
    if (isAspectTooNarrow()) {
        console.log('test');
        window.addEventListener('resize', () => {
            if (!isAspectTooNarrow() && !Game.started) {
                init();
            }
        });
        return;
    }
    let game = new Peekaboo('#game-canvas');
    game.assets.loadAll();
    game.debug = true;
}