import { button } from './retroPiePad.js'

export default class ControlsToWrite {

    constructor(scene) {
        this._input = scene.input;
        this._cooldowns = {};
    }

    /**
     * return {
     *  remove: true/false,
     *  nextDigit: true/false,
     *  nextChar: true/false,
     *  prevChar: true/false,
     *  done: true/false
     * }
     */
    getCurrectInput(time) {
        if (this._input.gamepad.total > 0) {
            return this._getGamePadInputs(time);
        } else {
            return {
                remove: false,
                nextDigit: false,
                nextChar: false,
                prevChar: false,
                done: false
            };
        }
    }

    _getGamePadInputs(time) {
        const keyCoolDown = 150;
        const input = this._readGamePad();
        const keys = Object.keys(input);
        const result = {};
        for (const key of keys) {
            const pressed = input[key];
            if (pressed) {
                const pressStartTime = this._cooldowns[key];
                const coolingDown = pressStartTime && (time - pressStartTime < keyCoolDown);
                if (coolingDown) {
                    result[key] = false;
                } else {
                    this._cooldowns[key] = time;
                    result[key] = true;
                }
            } else {
                this._cooldowns[key] = undefined;
                result[key] = false;
            }
        }
        return result;
    }

    _readGamePad() {
        const pad = this._input.gamepad.getPad(0);
        return {
            remove: pad.buttons[button.upperRight].value,
            nextDigit: pad.buttons[button.lowerRight].value,
            nextChar: pad.axes[1].getValue() > 0,
            prevChar: pad.axes[1].getValue() < 0,
            done: pad.buttons[button.frontLeft].value,
        };
    }
}