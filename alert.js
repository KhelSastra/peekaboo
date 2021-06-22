function _createElement(parent, tag, className, id, innerHTML, misc) {
    let elem = document.createElement(tag);
    if (className) elem.className = className;
    if (id) elem.id = id;
    if (innerHTML) elem.innerHTML = innerHTML;
    if (misc) {
        for (let x in misc) {
            elem[x] = misc[x];
        }
    }
    parent.appendChild(elem);
    return elem;
}

function initialiseAlert() {
    let mask = _createElement(document.body, 'div', 'v-flex-centered', 'alert-mask');
    let alert = _createElement(mask, 'div', 'v-flex-centered', 'alert');
    let alertH = _createElement(alert, 'div', '', 'alert-header');
    let alertB = _createElement(alert, 'div', '', 'alert-body');
    let alertF = _createElement(alert, 'div', '', 'alert-footer');
    let alertA = _createElement(alertF, 'button', '', 'alert-action', 'Action');
    let alertC = _createElement(alertF, 'button', '', 'alert-close', 'Close');
    document.getElementById('alert-close').onclick = hideAlert();
}

function createAlert(title, body, mode, callback, callbackLabel) {
    // setting mask's display to flex makes every child visible
    document.getElementById('alert-mask').style.display = 'flex';
    let close = document.getElementById('alert-close')
    // close button is only hidden in case of an error dialog, so we set this to block by default
    close.style.display = 'block';
    if (mode === 'error') {
        close.style.display = 'none'; // no point letting user continue on a broken site
        if (!callback) {
            // if no callback is supplied, this means there's no action and thus no buttons are present.
            // in such a case, we hide the footer
            document.getElementById('alert-footer').style.display = 'none';
        }
    } else {
        close.onclick = hideAlert;
    }

    let action = document.getElementById('alert-action');
    if (callback) { // if callback exists, enable the button for it and set the click action
        action.style.display = 'block';
        if (Boolean(callbackLabel)) {
            action.innerHTML = callbackLabel;
        } else {
            action.innerHTML = 'Action';
        }
        action.onclick = function() {
            callback();
        }
    } else {
        action.style.display = 'none';
    }

    document.getElementById('alert-header').innerHTML = title; // set dialog title
    document.getElementById('alert-body').innerHTML = body; // set dialog body
}

function hideAlert() {
    document.getElementById('alert-mask').style.display = 'none';
}

window.addEventListener('load', function() {
    initialiseAlert();
});