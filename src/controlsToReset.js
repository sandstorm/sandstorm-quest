import { button } from './retroPiePad.js'

/**
 * allows to restart the game (page refresh) via a Gamepad
 * (the browser already support keyboard refreshs)
 */
export default class ControlsToReset {

    constructor(scene) {
        this._input = scene.input;
    }

    /**
     * return {
     *  reset: true/false
     * }
     */
    getCurrectInput(time) {
        return {
            reset: this._getReset(time)
        }
    }

    _getReset(time) {
        if (this._input.gamepad.total > 0) {
            const pad = this._input.gamepad.getPad(0);
            const joystickUp = pad.axes[1].getValue() > 0;
            const isPressingReset = joystickUp &&
                pad.buttons[button.upperRight].value &&
                pad.buttons[button.frontLeft].value;
            if (isPressingReset) {
                this._holdingResetStart = this._holdingResetStart || time;
                if (time - this._holdingResetStart > 2000) {
                    this._holdingResetStart = undefined;
                    return true;
                } else {
                    return false;
                }
            } else {
                this._holdingResetStart = undefined;
            }


        } else {
            return false;
        }
    }
}