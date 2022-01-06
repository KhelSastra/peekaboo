var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/AssetManager.ts
import YAML from "https://esm.sh/yamljs";
var AssetManager = class {
  constructor(parent) {
    this.queue = [];
    this.successCount = 0;
    this.results = {};
    this.parent = parent;
    this.onload = null;
  }
  handleData(item, res) {
    if (!res.ok)
      throw new Error(`Loading asset ${item.name} failed.`);
    const store = (value) => this.results[item.name] = value;
    const onsuccess = () => {
      this.successCount += 1;
      if (this.isDone())
        this.onload();
    };
    const transformer = {
      img: { initial: "blob", final: (result) => createImageBitmap(result) },
      audio: { initial: "arrayBuffer", final: (result) => this.parent.audioCtx.decodeAudioData(result) },
      txt: { initial: "text", final: (result) => result },
      yaml: { initial: "text", final: (result) => YAML.parse(result) }
    }[item.type];
    res[transformer.initial]().then(transformer.final).then(store).then(onsuccess);
  }
  loadAll() {
    if (this.onload === null)
      throw new Error("AssetManager: callback not set");
    this.numFiles = this.queue.length;
    this.queue.forEach((elem, idx) => fetch(elem.url).then((res) => {
      this.handleData(elem, res);
      this.queue.splice(idx, 1);
    }));
  }
  queueItem(item) {
    if (!this.queue.includes(item))
      this.queue.push(item);
  }
  queueItems(arr) {
    arr.forEach((elem) => this.queueItem(elem));
  }
  isDone() {
    return this.numFiles === this.successCount;
  }
  getAsset(name) {
    return this.results[name];
  }
};

// src/Peekaboo.ts
import cfa from "https://esm.sh/cf-alert";

// src/AudioPlayer.ts
var AudioPlayer = class {
  constructor(parent) {
    this.parent = parent;
    this.musicPlaying = false;
  }
  playMusicFile(filename, loop = false) {
    if (this.musicPlaying) {
      this.musicPlaying = false;
      this.currentSourceNode.stop();
    }
    let src = this.parent.audioCtx.createBufferSource();
    src.buffer = this.parent.assets.getAsset(filename);
    src.connect(this.parent.audioCtx.destination);
    src.loop = loop;
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
};

// src/utils.ts
var MIN_ASPECT_RATIO = 1.2;
var CANVAS_SIZE = {
  x: 1280,
  y: 720
};
function isAspectTooNarrow() {
  return window.innerWidth / window.innerHeight < MIN_ASPECT_RATIO;
}
function isMobile() {
  return /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// src/Peekaboo.ts
var Peekaboo = class {
  constructor(selector, assetsDict) {
    this.started = false;
    this.debug = false;
    this.mouse = {
      x: 0,
      y: 0,
      left: false,
      right: false,
      middle: false
    };
    this.canvas = document.querySelector(selector);
    this.speakerName = document.querySelector("#vn-speaker-name");
    this.vnContainer = document.querySelector("#vn-controls");
    this.vnText = document.querySelector("#vn-text");
    this.prevBtn = document.querySelector("#vn-prev");
    this.nextBtn = document.querySelector("#vn-next");
    this.loadingDiv = document.querySelector("#loading");
    this.vnButtons = document.querySelector("#vn-buttons");
    this.audioCtx = new AudioContext();
    this.audio = new AudioPlayer(this);
    this.script = null;
    this.currentScene = null;
    this.currentMode = "story";
    this.currentDialogueIndex = 0;
    if (isMobile()) {
      for (let elem of [this.speakerName, this.vnContainer, this.vnText, this.vnButtons, this.canvas]) {
        elem.classList.add("mobile");
      }
    }
    this.prevBtn.onclick = (e) => {
      var _a;
      if (this.currentDialogueIndex > 0)
        this.currentDialogueIndex -= 1;
      else {
        if (this.currentSceneIdx > 0 && this.currentScene.dialogues) {
          this.setScene(this.currentSceneIdx - 1);
          this.currentDialogueIndex = (((_a = this.currentScene.dialogues) == null ? void 0 : _a.length) || 1) - 1;
          this.draw();
        }
      }
      this.draw();
    };
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
    };
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = CANVAS_SIZE.x;
    this.canvas.height = CANVAS_SIZE.y;
    this.onWindowResize(null);
    this.canvas.onmousemove = (e) => {
      this.onMouseMove(e);
    };
    this.canvas.onmousedown = (e) => {
      this.onMouseDown(e);
    };
    this.canvas.onmouseup = (e) => {
      this.onMouseUp(e);
    };
    window.addEventListener("resize", (e) => {
      this.onWindowResize(e);
    });
    this.assets = new AssetManager(this);
    this.assets.queueItems(assetsDict);
    this.assets.onload = () => {
      this.onload();
    };
    this.assets.loadAll();
  }
  onload() {
    if (this.debug)
      console.log("Finished loading assets.");
    this.begin();
  }
  onMouseMove(e) {
    let rect = this.canvas.getBoundingClientRect();
    this.mouse.x = Math.round((e.clientX - rect.left) / this.actualSize.x * CANVAS_SIZE.x);
    this.mouse.y = Math.round((e.clientY - rect.top) / this.actualSize.y * CANVAS_SIZE.y);
  }
  begin() {
    this.started = true;
    this.script = this.assets.getAsset("script");
    this.setScene(0);
    this.loadingDiv.style.display = "none";
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
    var _a;
    if (!this.started)
      return;
    this.ctx.clearRect(0, 0, CANVAS_SIZE.x, CANVAS_SIZE.y);
    if (this.currentScene.bg)
      this.drawBg(this.currentScene.bg);
    const game = document.querySelector("#game");
    switch (this.currentMode) {
      case "story": {
        game.style.justifyContent = "initial";
        this.canvas.style.cursor = "default";
        this.vnContainer.style.display = "flex";
        (_a = this.currentScene.sprites) == null ? void 0 : _a.forEach((sprite) => this.drawSprite(sprite));
        this.setCurrentDialogue(this.currentScene.dialogues[this.currentDialogueIndex]);
        break;
      }
      case "find": {
        this.vnContainer.style.display = "none";
        game.style.justifyContent = "center";
        this.canvas.style.cursor = "pointer";
        break;
      }
      default: {
        throw new Error("Unknown scene mode.");
      }
    }
  }
  setCurrentDialogue(dialogue) {
    if (!dialogue)
      return;
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
    if (!img)
      setTimeout(() => this.draw(), 100);
    else {
      this.ctx.drawImage(img, sprite.position.x, sprite.position.y);
    }
  }
  drawBg(name) {
    let img = this.assets.getAsset(name);
    if (!img)
      setTimeout(() => this.draw(), 100);
    else {
      this.ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, this.canvas.width, this.canvas.height);
    }
  }
  onWindowResize(e) {
    let computedHeight = 0.8 * document.body.clientHeight;
    let computedWidth = 16 / 9 * computedHeight;
    const epsilon = 5;
    while (computedWidth > document.body.clientWidth * 0.95) {
      computedWidth -= epsilon;
      computedHeight -= 0.5625 * epsilon;
    }
    this.actualSize = {
      x: computedWidth,
      y: computedHeight
    };
    this.canvas.style.width = computedWidth + "px";
    this.canvas.style.height = computedHeight + "px";
  }
  onMouseDown(e) {
    e.preventDefault();
    if (e.button == 0)
      this.mouse.left = true;
    if (e.button == 1)
      this.mouse.middle = true;
    if (e.button == 2)
      this.mouse.right = true;
  }
  onMouseUp(e) {
    e.preventDefault();
    if (e.button == 0)
      this.mouse.left = false;
    if (e.button == 1)
      this.mouse.middle = false;
    if (e.button == 2)
      this.mouse.right = false;
    if (this.currentMode === "find") {
      let mouse = this.mouse;
      let found = this.currentScene.rings.some((elem) => {
        return isPointInCircle(elem, mouse);
      });
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
        console.log(this.mouse);
      };
    } else {
      window.onmousemove = null;
    }
  }
  gameOver() {
    return __async(this, null, function* () {
      yield cfa.message(this.script.gameover.text, this.script.gameover.heading);
    });
  }
};
function distance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}
function isPointInCircle(circle, point) {
  return distance(circle.center, point) < circle.radius;
}

// src/main.ts
window.onload = init;
function init() {
  fetch("assets/txt/mahabalipuram_assets.json").then((value) => value.json()).then((assets) => {
    const game = new Peekaboo("#game-canvas", assets);
    if (isAspectTooNarrow()) {
      window.addEventListener("resize", () => {
        if (!isAspectTooNarrow() && !game.started) {
          init();
        }
      });
      return;
    }
    const window_ = window;
    window_.debug = () => {
      window_.game.debug = !window_.game.debug;
    };
  }).catch((err) => {
  });
}
