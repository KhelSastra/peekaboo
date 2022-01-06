import { cfa } from "./deps";
import { Peekaboo } from "./Peekaboo";
import { getQueryParams, isAspectTooNarrow } from "./utils";

window.onload = init;

function init() {
    const params = getQueryParams();
    if (!params.get('lang') || !params.get('script')) {
        window.location.href = window.location.href.replace('game.html', 'index.html');
    }
    fetch(`assets/txt/${params.get('script')}`)
        .then(value => value.json())
        .then(assets => {
            const game = new Peekaboo('#game-canvas', assets);
            if (isAspectTooNarrow()) {
                window.addEventListener('resize', () => {
                    if (!isAspectTooNarrow() && !game.started) {
                        init();
                    }
                });
                return;
            }

            const window_ = window as any;
            window_.game = game;
            window_.debug = () => {
                window_.game.debug = !window_.game.debug;
            }
        }).catch(err => {
            cfa.message(`Error: ${err} Try reloading the page.`);
        })
}