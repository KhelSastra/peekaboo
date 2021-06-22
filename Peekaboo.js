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
            width: CANVAS_SIZE.width,
            height: CANVAS_SIZE.height
        }

        this.canvas = document.querySelector(selector);
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = CANVAS_SIZE.width;
        this.canvas.height = CANVAS_SIZE.height;

        this.onWindowResize(null);

        this.updateActualSize();

        this.canvas.addEventListener('mousemove', (e) => {
            this.onMouseMove(e);
        });

        window.addEventListener('resize', (e) => {
            this.onWindowResize(e);
        });

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
        this.mouse.x = Math.round(((e.clientX - rect.left) / this.actualSize.width) * CANVAS_SIZE.width); // scale mouse x to be between 0 and CANVAS_SIZE
        this.mouse.y = Math.round(((e.clientY - rect.top) / this.actualSize.height) * CANVAS_SIZE.height); // scale mouse y to be between 0 and CANVAS_SIZE

        this.imgMousePos = Boolean(this.currentImage) ? {
            x: Math.round(this.mouse.x / CANVAS_SIZE.width * this.currentImage.width),
            y: Math.round(this.mouse.y / CANVAS_SIZE.height * this.currentImage.height)
        } : null;
        if (this.debug) {
            console.log(this.mouse);
            if (this.imgMousePos)
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
        if (first.mode == 'find') this.setCurrentImage(first.background);
        else if (first.mode == 'mode') {

        }
    }

    setCurrentImage(name) {
        let img = this.assets.getAsset(name);
        this.ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, this.canvas.width, this.canvas.height);
        this.currentImage = img;
    }

    drawSprite(name, position) {
        let img = this.assets.getAsset(name);
        this.ctx.drawImage(img, position.x, position.y);
    }

    onWindowResize(e) {
        let computedHeight = 0.80 * document.body.clientHeight;
        let computedWidth = 16 / 9 * computedHeight;

        const epsilon = 5;

        while (computedWidth > document.body.clientWidth * 0.95) {
            computedWidth -= epsilon;
            computedHeight -= epsilon;
        }

        this.canvas.style.width = computedWidth + 'px';
        this.canvas.style.height = computedHeight + 'px';
    }
}