import '../lib/phaser-3.15.1.min.js'
import LevelScene from './levelScene.js';
import HeadUpDisplayScene from './headUpDisplayScene.js'
import {canvasHeight, canvasWidth, debugging, gravity} from './constants.js';
import HighscoreScene from './highscoreScene.js';

const config = {
    type: Phaser.AUTO,
    width: canvasWidth,
    height: canvasHeight,
    parent: 'game-container',
    pixelArt: true,
    backgroundColor: '#3DCAFF',
    scene: [LevelScene, HeadUpDisplayScene, HighscoreScene],
    input: {
        gamepad: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: gravity},
            debug: debugging
        }
    }
};
const game = new Phaser.Game(config);