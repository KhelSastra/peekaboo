import { Peekaboo } from "./Peekaboo";
import { isAspectTooNarrow } from "./utils";

window.onload = init;

function init() {
    fetch('assets/txt/mahabalipuram_assets.json')
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
            window_.debug = () => {
                window_.game.debug = !window_.game.debug;
            }
        }).catch(err => {

        })
}