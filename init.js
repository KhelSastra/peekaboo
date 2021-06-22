window.onload = init;
const MIN_ASPECT_RATIO = 1.2;
const CANVAS_SIZE = {
    width: 1920,
    height: 1080
}

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
    },
    {
        name: 'AuntyResting',
        url: '/assets/img/AuntyResting.png',
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
    let game = new Peekaboo('#game-canvas');
    if (isAspectTooNarrow()) {
        console.log('test');
        window.addEventListener('resize', () => {
            if (!isAspectTooNarrow() && !game.started) {
                init();
            }
        });
        return;
    }
    game.assets.onLoad = function() {
        game.onLoad();
    }
    game.assets.loadAll();
    game.debug = true;
}