window.onload = init;

const MIN_ASPECT_RATIO = 1.2;
const CANVAS_SIZE = {
    x: 1280,
    y: 720
}

const ASSETS = [
    {
        name: 'script',
        url: 'assets/txt/mahabalipuram.json',
        type: 'txt'
    },
    {
        name: 'AuntyResting',
        url: 'assets/img/AuntyResting.png',
        type: 'img'
    },
    {
        name: 'Mandala',
        url: 'assets/img/MandalaBeige.png',
        type: 'img'
    },
    {
        name: 'MahabCrowdNoBaba',
        url: 'assets/img/MahabCrowd_NoBaba.png',
        type: 'img'
    },
    {
        name: 'MahabCrowdWithBaba',
        url: 'assets/img/MahabCrowd.png',
        type: 'img'
    },
    {
        name: 'Mahab1',
        url: 'assets/img/Mahab1.png',
        type: 'img'
    },
    {
        name: "Baba",
        url: "assets/img/baba.png",
        type: 'img'
    },
    {
        name: "BabaLarge",
        url: "assets/img/baba_large.png",
        type: 'img'
    }
]

function isAspectTooNarrow() {
    return (window.innerWidth / window.innerHeight) < MIN_ASPECT_RATIO;
}

function isMobile() {
    return /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
        if ('requestFullscreen' in document.documentElement) {
            document.documentElement.requestFullscreen().then(() => {
                window.game.onLoad();
            }).catch(err => {
                createAlert("Error", "You must allow fullscreen to play. Refresh the page and try again.", "error");
            });
        }
    }
    window.game.assets.loadAll();
    window.game.debug = true;
}