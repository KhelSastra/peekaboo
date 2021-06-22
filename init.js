window.onload = init;
const MIN_ASPECT_RATIO = 1.2;
const CANVAS_SIZE = {
    x: 1280,
    y: 720
}

const ASSETS = [{
        name: 'script',
        url: 'assets/txt/script.json',
        type: 'txt'
    },
    {
        name: 'AuntyResting',
        url: '/assets/img/AuntyResting.png',
        type: 'img'
    },
    {
        name: 'Mandala',
        url: 'assets/img/Mandala.png',
        type: 'img'
    },
    {
        name: 'find1',
        url: 'assets/img/find1.png',
        type: 'img'
    },
    {
        name: 'baba',
        url: 'assets/img/baba.png',
        type: 'img'
    }
]

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
    window.game = new Peekaboo('#game-canvas');
    if (isAspectTooNarrow()) {
        console.log('test');
        window.addEventListener('resize', () => {
            if (!isAspectTooNarrow() && !window.game.started) {
                init();
            }
        });
        return;
    }
    window.game.assets.onLoad = function() {
        window.game.onLoad();
    }
    window.game.assets.loadAll();
    window.game.debug = true;
}