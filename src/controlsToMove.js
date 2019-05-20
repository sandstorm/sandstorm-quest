import { button } from './retroPiePad.js'

export default class ControlsToMove {

    constructor(scene) {
        // keyboard
        const { LEFT, RIGHT, UP, DOWN, W, A, D, S, SPACE } = Phaser.Input.Keyboard.KeyCodes;
        this._input = scene.input;
        this._keys = scene.input.keyboard.addKeys({
            left: LEFT,
            right: RIGHT,
            up: UP,
            down: DOWN,
            w: W,
            a: A,
            d: D,
            s: S,
            space: SPACE
        });
    }

    /**
     * returns {
     *  up: true/false,
     *  down: true/false,
     *  left: true/false,
     *  right: true/false,
     *  attack: true/false,
     * }
     */
    getCurrentInput() {
        const inputs = [
            this._getKeyboardInput(),
            this._getGamePadInputs()
        ];
        return ['up', 'down', 'left', 'right', 'attack'].reduce(
            (acc, k) => {
                acc[k] = Boolean(inputs.find(i => i[k]));
                return acc;
            }, {}
        );
    }

    _getKeyboardInput() {
        const { left, right, up, down, a, d, w, s, space } = this._keys;
        return {
            up: (up.isDown || w.isDown),
            down: (down.isDown || s.isDown),
            left: (left.isDown || a.isDown),
            right: (right.isDown || d.isDown),
            attack: space.isDown
        }
    }

    _getGamePadInputs() {
        if (this._input.gamepad.total > 0) {
            const pad = this._input.gamepad.getPad(0);
            return {
                up: pad.buttons[button.upperLeft].value,
                down: pad.buttons[button.lowerLeft].value,
                left: pad.axes[0].getValue() > 0,
                right: pad.axes[0].getValue() < 0,
                attack: Boolean([
                    pad.buttons[button.upperRight],
                    pad.buttons[button.lowerRight],
                    pad.buttons[button.frontLeft],
                    pad.buttons[button.frontRight]
                ].find(b => b.value))
            };
        } else {
            return {};
        }
    }
}