import { cameraZoom, heart1of4, heart3of4, heartEmpty, heartFull, heartHalf, tileSize } from './constants.js';

/**
 * scene without zoom and without movement to show the status like current health and stuff
 */
export default class HeadUpDisplayScene extends Phaser.Scene {

    constructor() {
        super({ key: 'statusBar', active: true });
    }

    preload() {
        this.load.spritesheet('sprites', 'assets/simples_pimples.png', {
            frameWidth: tileSize,
            frameHeight: tileSize,
            margin: 0,
            spacing: 0
        });
    }

    create() {
        //  listen for events from level scene
        this.scene.get('level').events.on('setHealth', this._setHealth, this);
        this.scene.get('level').events.on('setScore', this._setScore, this);
        this.scene.get('level').events.on('setTime', this._setTime, this);

        this.hearts = [
            this._createHeart(0),
            this._createHeart(1),
            this._createHeart(2),
            this._createHeart(3),
            this._createHeart(4)
        ];

        this._score = this._createScore();
        this._timeCounter = this._createTimeCounter();
        // this._timeRect = this.add.rectangle(720, 100, 250, 50, '#ff0000', 0.7);
        // this._timeRect.setOrigin(0, 0);

        const camera = this.cameras.main;
        this._redOverlayCamera = this.cameras.add(0, 0, camera.width, camera.height)
            .setBackgroundColor('rgba(255,0,0,0.3)')
            .setVisible(false);
    }

    _createHeart(index) {
        // reminder size excludes camera zoom
        const heartSize = tileSize;
        // reminder: we set the coordinates of the center (not the upper left corner)
        // and position must include zoom
        const x = cameraZoom * (heartSize / 2 + index * heartSize);
        const y = cameraZoom * heartSize / 2;


        // also add background of heart
        this.add.sprite(x, y, 'health', 0)
            .setSize(tileSize, tileSize)
            .setScale(cameraZoom, cameraZoom)
            .setTexture('sprites', heartEmpty);

        return this.add.sprite(x, y, 'health', 0)
            .setSize(tileSize, tileSize)
            .setScale(cameraZoom, cameraZoom)
            .setTexture('sprites', heartFull);
    }

    _createScore() {
        const x = this.cameras.main.width / 1.3;
        const y = 0;
        return this.add.text(x, y, 'Score: 0', {
            fontSize: '32px',
            align: 'center',
            fill: '#FFFFFF',
            backgroundColor: 'transparent'
        });
    }

    _createTimeCounter() {
        const x = this.cameras.main.width / 1.3;
        const y = 40;
        return this.add.text(x, y, 'Score: 0', {
            fontSize: '32px',
            align: 'center',
            fill: '#FFFFFF',
            backgroundColor: 'transparent'
        });
    }

    _setHealth(health) {
        this._updateHeart(0, health);
        this._updateHeart(1, health);
        this._updateHeart(2, health);
        this._updateHeart(3, health);
        this._updateHeart(4, health);

        this._isAlive = health > 0;
        const isDamage = this._lastHealth !== undefined && health < this._lastHealth;
        this._lastHealth = health;
        if (isDamage) {
            this._redOverlayCamera.setVisible(true);
        }
    }

    _setScore(score) {
        this._score.setText('Score: ' + score);
        if (score > 0) {
            this._score.setColor('#FFD700');
        }
    }

    _setTime(time) {
        const ms = time;
        const m = Math.floor(ms / 1000 / 60);
        const s = Math.floor(ms / 1000 % 60);
        this._timeCounter.setText('Time: ' + m + ':' + (s < 10 ? "0" : "") + s);
    }

    /**
     * @param index index of the heart from 0 to 3 (each heart shows 4 hit points)
     * @param health overall health
     * @private
     */
    _updateHeart(index, health) {
        const pointsOfHeart = Math.max(0, Math.min(2, health - index * 2));
        this.hearts[index].setTexture('sprites', this._findHeartSprite(pointsOfHeart));
    }

    _findHeartSprite(points) {
        switch (points) {
            case 0:
                return heartEmpty;
            case 1:
                return heartHalf;
            case 2:
                return heartFull;
        }
    }

    update(time) {
        if (this._redOverlayCamera.visible) {
            this._redOverlayCameraVisibleTime = this._redOverlayCameraVisibleTime || time;
            if (this._isAlive && time - this._redOverlayCameraVisibleTime >= 100) {
                this._redOverlayCamera.setVisible(false);
                this._redOverlayCameraVisibleTime = undefined;
            }
        }
        if (this._score.style.color !== '#ffffff') {
            this._scoreColoredTime = this._scoreColoredTime || time;
            if (time - this._scoreColoredTime >= 400) {
                this._score.setColor('#ffffff');
                this._scoreColoredTime = undefined;
            }
        }
    }
}
