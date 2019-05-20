export default class Timer {

    constructor(scene) {
        this._scene = scene;
        this.reset();
    }

    reset() {
        this._startTime = undefined;
        this._endTime = undefined;
    }

    start(startTime) {
        this._startTime = startTime;
        this._endTime = undefined;
    }

    stop(endTime) {
        this._endTime = endTime;
    }

    update(time) {
        if (this._startTime) {
            const upperBound = this._endTime || time;
            const currentTime = upperBound - this._startTime;
            this._scene.events.emit('setTime', currentTime);
        } else {
            this._scene.events.emit('setTime', 0);
        }
    }
}