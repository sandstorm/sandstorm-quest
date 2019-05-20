import {
    fireInterval,
    gravity,
    playerAccelerationAirborne,
    playerAccelerationClimbingOrSwimming,
    playerAccelerationWalking,
    playerClimbOrSwimVelocity,
    playerDead,
    playerDragX,
    playerJump,
    playerJumpVelocity,
    playerMaxVelocityX,
    playerMaxVelocityY,
    playerRun,
    playerStand,
    projectileMaxDistance,
    projectileSmallFade,
    projectileSmallFlight,
    projectileSmallSpawn,
    projectileSpeed,
    tileSize
} from './constants.js';
import { moveX } from './helpers.js';
import ControlsToMove from './controlsToMove.js';

/**
 * main player class
 */
export default class Player {

    constructor(scene, x, y, {score}, createProjectile) {
        this.scene = scene;
        this._gravityPercentage = 1;
        this._setHealth(10);
        this.setScore(score);

        // Create the animations we need from the player spritesheet
        const anims = scene.anims;
        anims.create({
            key: 'player-run',
            frames: anims.generateFrameNumbers('player', { start: playerStand, end: playerRun }),
            frameRate: 9,
            repeat: -1
        });

        // Create the physics-based sprite that we will move around and animate
        this.sprite = scene.physics.add
            .sprite(x, y, 'player', 0)
            // the player should slow down by itself
            .setDrag(playerDragX, 0)
            // max speed
            .setMaxVelocity(playerMaxVelocityX, playerMaxVelocityY)
            /*
             * make player slightly smaller, so he can fit through narrow passages with a small pixel offset
             *
             * This is rather tricky: we do not want a have a tiny dwarf, so
             * - the sprite should stay (almost) the same size
             * - wall-collision detection should use a smaller player
             * - potion/monster/liquid-collision detection can use the original size player
             *
             * Thus we leave our custom tileSize-based collision detection as is
             * and shrink the physical body of the player (not the sprite)
             * and hang the sprite higher to make the center of the player appear at its original position
             * though is is not.
             * Since we use the (x,y) of the player for custom collision-detection
             * we have to adjust it a bit, since the new is (x',y') = (x,y) + (0,dy).
             */
            .setSize(0.5 * tileSize, 0.5 * tileSize)
            .setOffset(0.25 * tileSize, 0.5 * tileSize);

        // input
        const controls = new ControlsToMove(scene);

        // create different strategies for movement and rendering
        this.strategies = [
            new DeadPlayer(this.sprite),
            new AlivePlayerSwimmingOrClimbing(this.sprite, controls),
            new AlivePlayerOnLand(this.sprite, controls, settings => createProjectile({ player: this, ...settings }))
        ];
    }

    changeScore(score) {
        this.setScore(Math.max(0, this.score + score));
    }

    setScore(score) {
        this.score = score;
        this.scene.events.emit('setScore', this.score);
    }

    changeHealth(delta) {
        this._setHealth(Math.max(0, Math.min(10, this._health + delta)));
    }

    _setHealth(health) {
        this._health = health;
        this.scene.events.emit('setHealth', this._health);
    }

    isAlive() {
        return this._health > 0;
    }

    setGravityPercentage(percentage) {
        this._gravityPercentage = percentage;
        this.sprite.body.setAllowGravity(percentage !== 0);
        if (percentage !== undefined) {
            this.sprite.body.setGravityY(percentage * gravity);
            return true;
        } else {
            this.sprite.body.setGravityY(gravity);
            return false;
        }
    }

    update(time) {
        /*
         * player
         */
        const currentState = {
            time,
            health: this._health,
            gravity: this._gravityPercentage,
            isSwimmingOrClimbing: this._gravityPercentage < 1
        };
        const strategy = this.strategies.filter(s => s.shouldBeUsed(currentState))[0];
        strategy.update(currentState);
    }

    destroy() {
        this.sprite.destroy();
    }
}

/**
 * rendering and movement strategy of a dead player
 */
class DeadPlayer {
    constructor(sprite) {
        this.sprite = sprite;
    }

    shouldBeUsed({ health }) {
        return health <= 0;
    }

    update({ isSwimmingOrClimbing }) {
        if (isSwimmingOrClimbing) {
            this.sprite.setVelocityY(0);
        }
        this.sprite.anims.stop();
        this.sprite.setTexture('player', playerDead);
        this.sprite.setAccelerationX(0);
    }
}

/**
 * player movement and rendering when in liquid or on ladders (might be split into two later)
 */
class AlivePlayerSwimmingOrClimbing {

    constructor(sprite, controls) {
        this.sprite = sprite;
        this.controls = controls;
    }

    shouldBeUsed({ gravity }) {
        // ladders and liquids reduce gravity in order to allow "a different kind of movement"
        return gravity < 1;
    }

    update() {
        this._move();
        this._render();
    }

    _move() {
        const input = this.controls.getCurrentInput();
        movementX(this.sprite, input, playerAccelerationClimbingOrSwimming);

        const sprite = this.sprite;
        // TODO: vertical movement with acceleration instead of velocity would be much nicer
        if (input.up) {
            sprite.setVelocityY(-playerClimbOrSwimVelocity);
        } else if (input.down) {
            sprite.setVelocityY(playerClimbOrSwimVelocity);
        } else {
            // stop falling when entering ladders or water
            // TODO: max velocity Y would be much nicer here
            sprite.setVelocityY(0);
        }
    }

    _render() {
        // TODO: this is not nice yet
        this.sprite.anims.stop();
        this.sprite.setTexture('player', playerJump);
    }
}

/**
 * rendering and movement for alive player jumping and running on solid ground
 */
class AlivePlayerOnLand {

    constructor(sprite, controls, createProjectile) {
        this.sprite = sprite;
        this.controls = controls;
        this.createProjectile = createProjectile;
    }

    shouldBeUsed() {
        // fall-back strategy
        return true;
    }

    update({ time }) {
        this._attack(time);
        this._move();
        this._render();
    }

    _attack(time) {
        const input = this.controls.getCurrentInput();
        if (input.attack) {
            const isLeft = this.sprite.flipX;
            if (this._lastShotTime === undefined || time - this._lastShotTime > fireInterval) {
                this._lastShotTime = time;
                this.createProjectile({
                    position: {
                        x: this.sprite.x,
                        y: this.sprite.y
                    },
                    velocity: {
                        x: (isLeft ? -1 : 1) * projectileSpeed,
                        y: 0
                    },
                    maxDistance: projectileMaxDistance,
                    frameSpawn: projectileSmallSpawn,
                    frameFlight: projectileSmallFlight,
                    frameFade: projectileSmallFade
                });
            }
        }
    }

    _move() {
        const isStanding = this.sprite.body.blocked.down;
        const input = this.controls.getCurrentInput();
        movementX(this.sprite, input, isStanding ? playerAccelerationWalking : playerAccelerationAirborne);
        // only standing player can jump, no jump when airborne
        if (isStanding && input.up) {
            this.sprite.setVelocityY(-playerJumpVelocity);
        }
    }

    _render() {
        const sprite = this.sprite;
        const onGround = sprite.body.blocked.down;
        if (onGround) {
            if (sprite.body.velocity.x !== 0) {
                sprite.anims.play('player-run', true);
            } else {
                sprite.anims.stop();
                sprite.setTexture('player', playerStand);
            }
        } else {
            sprite.anims.stop();
            sprite.setTexture('player', playerJump);
        }
    }
}

function movementX(sprite, input, acceleration) {
    if (input.left) {
        moveX(sprite, -acceleration);
    } else if (input.right) {
        moveX(sprite, acceleration);
    } else {
        sprite.setAccelerationX(0);
    }
}
