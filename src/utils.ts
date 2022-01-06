export const MIN_ASPECT_RATIO = 1.2;
export const CANVAS_SIZE = {
    x: 1280,
    y: 720
}

export function isAspectTooNarrow() {
    return (window.innerWidth / window.innerHeight) < MIN_ASPECT_RATIO;
}

export function isMobile() {
    return /Android|webOS|iPhone|iPad|Mac|Macintosh|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export const removeByValue = function (arr: any[], v: any) {
    let idx = this.indexOf(v);
    if (idx != -1) {
        arr.splice(idx, 1);
        return true;
    }
    return false;
}