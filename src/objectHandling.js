import { cameraWidth, canvasHeight, canvasWidth, objectsLayer } from './constants.js';

export default class ObjectHandling {

    constructor(level, player, timer, map) {
        this.level = level;
        this.player = player;
        this.timer = timer;
        this.map = map;
        this.messageBox = document.getElementById('messages');
    }

    update(time) {
        const activeObjects = this._getActiveObjects();
        this._handleMessages(activeObjects);
        this._handleNextLevel(activeObjects);
        this._handleStartOfGame(time, activeObjects);
        this._handleEndOfGame(time, activeObjects);
    }

    _getActiveObjects() {
        return this.map.filterObjects(objectsLayer,
            // reminder: player x, y is the center of the player
            // whereas object x, y is the upper left corner
            obj => Math.abs(this.player.sprite.x - (obj.x + obj.width / 2)) < obj.width / 2
                && Math.abs(this.player.sprite.y - (obj.y + obj.height / 2)) < obj.height / 2
        );
    }

    _handleMessages(activeObjects) {
        this._setMessage(this._getProperty(activeObjects, 'message'));
    }

    _setMessage(message) {
        if (this.currentMessage !== message) {
            this.currentMessage = message;
            if (message) {
                // we place the message on the opposite side (x-direction) of the player
                // TODO: this is not correct since the player will always be below camera-width when climbing down ladders
                const putAbovePlayer = this.player.sprite.y > 0.6 * cameraWidth;
                const top = putAbovePlayer ? 0.4 * canvasHeight : 0.75 * canvasHeight;
                this.messageBox.style.cssText = `width:${canvasWidth / 2}px;left:${canvasWidth / 4}px;top:${top}px`;
                this.messageBox.innerText = message;
            } else {
                this._destroy();
            }
        }
    }

    _handleNextLevel(activeObjects) {
        const nextLevel = this._getProperty(activeObjects, 'nextLevel');
        if (nextLevel) {
            this.level.setLevel(nextLevel);
        }
    }

    _handleStartOfGame(time, activeObjects) {
        const isInStartOfGame = Boolean(activeObjects.find(o => o.name === 'Start of Game'));
        const wasInStartOfGameBeforeSomeMillis = this._wasInStartOfGameBeforeSomeMillis;
        const hasEntered = !wasInStartOfGameBeforeSomeMillis && isInStartOfGame;
        const hasLeft = wasInStartOfGameBeforeSomeMillis && !isInStartOfGame;
        this._wasInStartOfGameBeforeSomeMillis = isInStartOfGame;
        if (hasEntered) {
            // on enter
            this.player.setScore(0);
            this.timer.reset();
            this.level.scene.get('Highscore').handleReset();
        }
        if (hasLeft) {
            // on leave
            this.timer.start(time);
        }
    }

    _handleEndOfGame(time, activeObjects) {
        const isEndOfGame = Boolean(activeObjects.find(o => o.name === 'End of Game'));
        const wasInEndOfGameBeforeSomeMillis = this._wasInEndOfGameBeforeSomeMillis;
        const hasEntered = !wasInEndOfGameBeforeSomeMillis && isEndOfGame;
        const hasLeft = wasInEndOfGameBeforeSomeMillis && !isEndOfGame;
        this._wasInEndOfGameBeforeSomeMillis = isEndOfGame;
        if (hasEntered) {
            // on enter
            this.timer.stop(time);
            const eogScene = this.level.scene.get('Highscore');
            eogScene.handleEndOfGame(this.player.score);
        }
        if (hasLeft) {
            // on leave
            eogScene.handleReset();
        }
    }

    _getProperty(activeObjects, property) {
        const objectsWithProperty = activeObjects.filter(
            obj => obj.properties && obj.properties.filter(p => p.name === property).length > 0
        );
        const propertyObject = objectsWithProperty.length > 0 && objectsWithProperty[0];
        return propertyObject && propertyObject.properties.filter(p => p.name === property)[0].value;
    }

    _destroy() {
        this.messageBox.style.cssText = 'visibility:hidden';
        this.currentMessage = null;
    }
}
