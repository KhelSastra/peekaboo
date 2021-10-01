window.onload = init;

const MIN_ASPECT_RATIO = 1.2;
const CANVAS_SIZE = {
    x: 1280,
    y: 720
}

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
    fetch('assets/txt/mahabalipuram_assets.json')
    .then(value => value.json())
    .then(assets => {
        window.game = new Peekaboo('#game-canvas', assets);
        if (isAspectTooNarrow()) {
            window.addEventListener('resize', () => {
                if (!isAspectTooNarrow() && !window.game.started) {
                    init();
                }
            });
            return;
        }
        
        window.game.debug = true;
    })
}