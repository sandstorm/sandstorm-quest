/**
 * This file contains the overall game engine to run a game.
 */

/**
 * polyfill requestAnimationFrame
 *
 * copied from "Pro HTML 5 Games" Listing 1-24
 * with some renaming and code formatting
 */
(function () {
    var lastCall = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; x++) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback, element) {
            var now = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (now - lastCall));
            var id = window.setTimeout(function () {
                callback(now + timeToCall);
            }, timeToCall);
            lastCall = now + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }
}());

function _gameLoop(startTime, time, game, priorGameState, currentGameState) {
    // get next game state
    var nextGameState = game.animate({priorGameState: currentGameState, time});
    // schedule next update
    requestAnimationFrame(function () {
        _gameLoop(startTime, new Date().getTime() - startTime, game, currentGameState, nextGameState);
    });
    // render current game state if it has changed
    if (priorGameState !== currentGameState) {
        game.draw({gameState: currentGameState, time});
    }
    // TODO: terminate at some point in time
}

function runGame(game) {
    var now = new Date().getTime();
    var firstGameState = game.init(now);
    _gameLoop(now, 0, game, null, firstGameState);
}
