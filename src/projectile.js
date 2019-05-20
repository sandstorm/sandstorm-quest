/**
 * some sort of bullet
 */
import {projectileFadeDuration, projectileSpwanDuration, tileSize} from './constants.js';
import {distance, length} from './helpers.js';

export default class Projectile {

    constructor({player, scene, position, velocity, maxDistance, frameSpawn, frameFlight, frameFade}) {
        this.player = player;
        this.sprite = scene.physics.add
            .sprite(position.x, position.y, 'player', frameSpawn)
            .setVelocity(velocity.x, velocity.y)
            .setFlipX(velocity.x < 0)
            .setSize(tileSize, 0.15 * tileSize);
        this.sprite.body.setAllowGravity(false);

        this._creationPosition = position;
        this._maxDistance = maxDistance;
        this._frameSpawn = frameSpawn;
        this._frameFlight = frameFlight;
        this._frameFade = frameFade;
    }

    /**
     * @param time current time in game
     * @returns {boolean} projectile is already gone and should be removed
     */
    update(time, monsters) {
        this._creationTime = this._creationTime || time;
        const fades = this._distance() > this._maxDistance || this._velocity() === 0;
        if (fades) {
            this._fadeStart = this._fadeStart || time;
            this.sprite.setTexture('player', this._frameFade);
            this.sprite.setVelocity(0, 0);
            // has already vanished?
            return time - this._fadeStart > projectileFadeDuration;
        } else {
            const isHit = this.hitMonster(monsters);
            if (isHit) {
                // this will cause the projectile to fade in next rendering
                this.sprite.setVelocity(0, 0);
            } else {
                const spawns = time - this._creationTime < projectileSpwanDuration;
                this.sprite.setTexture('player', spawns ? this._frameSpawn : this._frameFlight);
                return false;
            }
        }
    }

    hitMonster(monsters) {
        const targets = monsters.filter(this._isHit.bind(this));
        if (targets.length > 0) {
            const monster = targets[0];
            monster.changeHealth(-1);
            if (!monster.isAlive()) {
                this.player.changeScore(monster.score);
            }
            return true;
        } else {
            return false;
        }
    }

    _isHit(monster) {
        if (monster.isAlive()) {
            const {x, y, height, width} = this.sprite;
            const sprite = monster.sprite;
            const dx = (width + sprite.width) / 2;
            const dy = (height + sprite.height) / 2;
            return Math.abs(x - sprite.x) < dx && Math.abs(y - sprite.y) < dy;
        } else {
            return false;
        }
    }

    _velocity() {
        return length(this.sprite.body.velocity);
    }

    _distance() {
        return distance(this._creationPosition, this.sprite);
    }

    destroy() {
        this.sprite.destroy();
    }
}