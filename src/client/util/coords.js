// Reference screen size
var refW = 1100;
var refH = 1100;

// Viewport render dimensions (pixels)
var width = Math.max(window.innerWidth, document.body.clientWidth, refW);
var height = Math.max(window.innerHeight, document.body.clientHeight, refH);

// Midpoint from screen space
var midW = width / 2;
var midH = height / 2;

var ratio = Math.min(width / refW, height / refH);

function ratio(w, h) {
    return h / w;
}

function scaleSize(w, h) {
    var r = ratio(w, h);
    var p = w * 100 / refW;
    
    var nw = p / 100 * width;
    var nh = nw * r;

    return {
        width : nw,
        height : nh
    };
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
