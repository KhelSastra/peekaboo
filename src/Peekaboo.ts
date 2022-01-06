import { AssetManager } from "./AssetManager";
import { Sprite, Scene, Script, Point } from "./types";
import cfa from "https://esm.sh/cf-alert";
import { AudioPlayer } from "./AudioPlayer";
import { CANVAS_SIZE, isMobile } from "./utils";

export class Peekaboo {
    started: boolean;
    debug: boolean;
    mouse: { x: number; y: number; left: boolean; right: boolean; middle: boolean; };
    canvas: HTMLCanvasElement;
    speakerName: HTMLDivElement;
    vnContainer: HTMLDivElement;
    vnText: HTMLDivElement;
    prevBtn: HTMLButtonElement;
    nextBtn: HTMLButtonElement;
    loadingDiv: HTMLDivElement;
    vnButtons: HTMLButtonElement;
    audioCtx: AudioContext;
    audio: AudioPlayer;
    script: Script | null;
    currentSprites: Sprite[];
    currentScene: Scene;
    currentMode: string;
    currentDialogueIndex: number;
    currentSceneIdx: number;
    ctx: CanvasRenderingContext2D;
    assets: AssetManager;
    actualSize: Point;
    foundImages: number;
    isLoggingMousePos: boolean;

    constructor(selector: string, assetsDict: any) {
        this.started = false;
        this.debug = false;
        this.mouse = {
            x: 0,
            y: 0,
            left: false,
            right: false,
            middle: false
        }

        this.canvas = document.querySelector(selector);
        this.speakerName = document.querySelector('#vn-speaker-name');
        this.vnContainer = document.querySelector('#vn-controls');
        this.vnText = document.querySelector('#vn-text');
        this.prevBtn = document.querySelector("#vn-prev");
        this.nextBtn = document.querySelector("#vn-next");
        this.loadingDiv = document.querySelector('#loading');
        this.vnButtons = document.querySelector('#vn-buttons');
        this.audioCtx = new AudioContext();
        this.audio = new AudioPlayer(this);
        this.script = null;
        this.currentScene = null;
        this.currentMode = 'story';
        this.currentDialogueIndex = 0;

        if (isMobile()) {
            for (let elem of [this.speakerName, this.vnContainer, this.vnText, this.vnButtons, this.canvas]) {
                elem.classList.add('mobile');
            }
        }

        this.prevBtn.onclick = (e) => {
            if (this.currentDialogueIndex > 0) this.currentDialogueIndex -= 1;
            else {
                if (this.currentSceneIdx > 0 && this.currentScene.dialogues) {
                    this.setScene(this.currentSceneIdx - 1);
                    this.currentDialogueIndex = (this.currentScene.dialogues?.length || 1) - 1;
                    this.draw();
                }
            }
            this.draw();
        }
        this.nextBtn.onclick = (e) => {
            this.currentDialogueIndex += 1;
            if (this.currentDialogueIndex >= this.currentScene.dialogues.length) {
                if (this.script.scenes.length > this.currentSceneIdx) {
                    this.setScene(this.currentSceneIdx + 1);
                    this.draw();
                } else {
                    this.gameOver();
                }
            } else {
                this.draw();
            }
        }

        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = CANVAS_SIZE.x;
        this.canvas.height = CANVAS_SIZE.y;

        this.onWindowResize(null);

        this.canvas.onmousemove = (e) => {
            this.onMouseMove(e);
        };

        this.canvas.onmousedown = (e) => {
            this.onMouseDown(e);
        }

        this.canvas.onmouseup = (e) => {
            this.onMouseUp(e);
        }

        window.addEventListener('resize', (e) => {
            this.onWindowResize(e);
        });

        this.assets = new AssetManager(this);

        this.assets.queueItems(assetsDict);
        this.assets.onload = () => {
            this.onload();
        }
        this.assets.loadAll();
    }

    onload() {
        if (this.debug) console.log('Finished loading assets.');
        this.begin();
    }

    onMouseMove(e) {
        let rect = this.canvas.getBoundingClientRect();
        this.mouse.x = Math.round(((e.clientX - rect.left) / this.actualSize.x) * CANVAS_SIZE.x); // scale mouse x to be between 0 and CANVAS_SIZE
        this.mouse.y = Math.round(((e.clientY - rect.top) / this.actualSize.y) * CANVAS_SIZE.y); // scale mouse y to be between 0 and CANVAS_SIZE
    }

    begin() {
        this.started = true;
        this.script = this.assets.getAsset('script');
        this.setScene(0);
        this.loadingDiv.style.display = 'none';
        this.draw();
    }

    setScene(idx) {
        this.currentSceneIdx = idx;
        let scene = this.script.scenes[idx];
        if (!scene) {
            this.gameOver();
            return;
        }
        this.currentScene = scene;
        this.currentMode = scene.mode;
        this.currentDialogueIndex = 0;
        this.foundImages = 0;
    }

    drawScene(idx) {
        this.setScene(idx);
        this.draw();
    }

    draw() {
        if (!this.started) return;
        this.ctx.clearRect(0, 0, CANVAS_SIZE.x, CANVAS_SIZE.y);
        if (this.currentScene.bg) this.drawBg(this.currentScene.bg);

        const game = document.querySelector("#game") as HTMLElement;

        switch (this.currentMode) {
            case 'story': {
                game.style.justifyContent = 'initial';
                this.canvas.style.cursor = 'default';
                this.vnContainer.style.display = 'flex';
                this.currentScene.sprites?.forEach(sprite => this.drawSprite(sprite));
                this.setCurrentDialogue(this.currentScene.dialogues[this.currentDialogueIndex]);
                break;
            }
            case 'find': {
                this.vnContainer.style.display = 'none';
                game.style.justifyContent = 'center';
                this.canvas.style.cursor = 'pointer';
                break;
            }
            default: {
                throw new Error("Unknown scene mode.");
            }
        }
    }

    setCurrentDialogue(dialogue) {
        if (!dialogue) return;
        this.speakerName.innerHTML = dialogue.speaker;
        this.vnText.innerHTML = dialogue.text;
    }

    setBgGradient(c1, c2) {
        let gradient = this.ctx.createLinearGradient(0, 0, CANVAS_SIZE.x, CANVAS_SIZE.y);
        gradient.addColorStop(0, c1);
        gradient.addColorStop(1, c2);
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, CANVAS_SIZE.x, CANVAS_SIZE.y);
    }

    drawSprite(sprite) {
        let img = this.assets.getAsset(sprite.name);
        if (!img) setTimeout(() => this.draw(), 100);
        else {
            this.ctx.drawImage(img, sprite.position.x, sprite.position.y);
        }
    }

    drawBg(name) {
        let img = this.assets.getAsset(name);
        if (!img) setTimeout(() => this.draw(), 100);
        else {
            this.ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, this.canvas.width, this.canvas.height);
        }
    }

    onWindowResize(e) {
        let computedHeight = 0.80 * document.body.clientHeight;
        let computedWidth = 16 / 9 * computedHeight;

        const epsilon = 5;

        while (computedWidth > document.body.clientWidth * 0.95) {
            computedWidth -= epsilon;
            computedHeight -= 0.5625 * epsilon;
        }

        this.actualSize = {
            x: computedWidth,
            y: computedHeight
        }

        this.canvas.style.width = computedWidth + 'px';
        this.canvas.style.height = computedHeight + 'px';
    }

    onMouseDown(e) {
        e.preventDefault()
        if (e.button == 0) this.mouse.left = true;
        if (e.button == 1) this.mouse.middle = true;
        if (e.button == 2) this.mouse.right = true;
    }

    onMouseUp(e) {
        e.preventDefault()
        if (e.button == 0) this.mouse.left = false;
        if (e.button == 1) this.mouse.middle = false;
        if (e.button == 2) this.mouse.right = false;

        if (this.currentMode === 'find') {
            let mouse = this.mouse;
            let found = this.currentScene.rings.some((elem) => {
                return isPointInCircle(elem, mouse);
            })
            if (found) {
                if (this.script.scenes.length > this.currentSceneIdx + 1) {
                    this.setScene(this.currentSceneIdx + 1);
                    this.draw();
                } else {
                    this.gameOver();
                }
            }
        }
    }

    logMousePos() {
        if (!this.isLoggingMousePos) {
            window.onmousemove = () => {
                console.log(this.mouse)
            }
        } else {
            window.onmousemove = null;
        }
    }

    async gameOver() {
        await cfa.message(this.script.gameover.text, this.script.gameover.heading);
    }
}

function distance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function isPointInCircle(circle, point) {
    return distance(circle.center, point) < circle.radius;
}