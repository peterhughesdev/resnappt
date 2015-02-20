// Reference screen size
var refW = 2048;
var refH = 1536;

// Viewport render dimensions (pixels)
var width = Math.max(window.innerWidth, document.body.clientWidth);
var height = Math.max(window.innerHeight, document.body.clientHeight);

// Midpoint from screen space
var midW = width / 2;
var midH = height / 2;


function ratio(w, h) {
    return h / w;
}

function scaleSize(w, h) {
    var dw = w / refW;
    var dh = h / refH;

    return dh < dw ? { x : dh, y : dh } : { x : dw, y : dw };
}

function translateToScreen(x, y) {
    return {
        x : (x/refW) * width,
        y : (y/refH) * height
    };
}

function translateToGame(x, y) {
    return {
        x : x - midW,
        y : y - midH
    };
}

module.exports = {
    ratio : ratio,
    width : width,
    height : height,
    scaleSize : scaleSize,
    translateToScreen : translateToScreen,
    translateToGame : translateToGame
};
