import {approachesHole, approachesObstacle, canSee, holeSensor, lineOfSight, moveX, obstacleSensor} from './helpers.js';
import {debugging, playerAccelerationWalking, playerDragX, playerJumpVelocity, playerMaxVelocityX, playerMaxVelocityY, tileSize} from './constants.js';

const spiderViusualRange = 10 * tileSize;
const spiderStand = 576;
const spiderAttack = 580;
const spiderDead = 581;
const spiderAttackDelay = 600;
const spiderHealth = 2;

const plusMinus = (delta) => random(1 - delta, 1 + delta);
const random = (min, max) => Math.random() * (max - min) + min;

export const monsterByName = {
    'spider': (scene, x, y, world, dynamic) => new Spider(scene, x, y, world, dynamic),
    'zombie': (scene, x, y, world, dynamic) => new Zombie(scene, x, y, world, dynamic),
    'Scorpion': (scene, x, y, world, dynamic) => new Scorpion(scene, x, y, world, dynamic),
    'Rat': (scene, x, y, world, dynamic) => new Rat(scene, x, y, world, dynamic),
    'Ice': (scene, x, y, world, dynamic) => new Ice(scene, x, y, world, dynamic)
};

class MeleeMonster {

    constructor(scene, x, y, world, dynamic, config) {
        this.score = config.score;
        this._world = world;
        this._dynamic = dynamic;
        this.sprite = scene.physics.add
            .sprite(x, y, 'player', config.standSprite)
            .setDrag(0.75 * config.dragX, 0)
            .setMaxVelocity(config.maxVelocityX, config.maxVelocityY)
            .setScale(config.scale, config.scale);
        this._health = config.health;
        this._gfx = debugging ? scene.add.graphics() : null;
        this._states = {
            'idle': new IdleMonster(this.sprite),
            'attacking': new CloseCombatAttackingMonster(this.sprite, this._gfx, config),
            'dead': new DeadMonster(this.sprite, config)
        };
        this._currentState = 'idle';
    }

    isAlive() {
        return this._health > 0;
    }

    changeHealth(delta) {
        this._health += delta;
        if (this._health <= 0) {
            this._currentState = 'dead';
        }
    }

    update(time, player) {
        if (this._gfx) {
            this._gfx.clear();
        }
        this._currentState = this._states[this._currentState].update({
            time,
            player,
            worlds: [this._world, this._dynamic],
            gfx: this._gfx
        }) || this._currentState;
    }

    destroy() {
        this.sprite.destroy();
        if (this._gfx) {
            this._gfx.clear().destroy();
        }
    }
}

/**
 * The spider runs to the player and attacks.
 * It can jump as well.
 */
export class Spider extends MeleeMonster {
    constructor(scene, x, y, world, dynamic) {
        super(scene, x, y, world, dynamic, {
            standSprite: 576,
            deadSprite: 581,
            spriteAttack: 580,
            moveSprites: 576,
            dragX: playerDragX,
            maxVelocityX: plusMinus(0.2) * 80,
            maxVelocityY: plusMinus(0.05) * playerMaxVelocityY,
            health: spiderHealth,
            attackDelay: spiderAttackDelay,
            jumpVelocity: -300,
            damage: 1,
            score: 20,
            scale: 0.75
        });
    }
}
export class Zombie extends MeleeMonster {
    constructor(scene, x, y, world, dynamic) {
        super(scene, x, y, world, dynamic, {
            standSprite: 276,
            deadSprite: 281,
            spriteAttack: 280,
            moveSprites: 277,
            dragX: playerDragX,
            maxVelocityX: plusMinus(0.1) * 32,
            maxVelocityY: plusMinus(0.02) * playerMaxVelocityY,
            health: 7,
            attackDelay: 1500,
            jumpVelocity: -200,
            damage: 2,
            score: 40,
            scale: 1.2
        });
    }
}
export class Scorpion extends MeleeMonster {
    constructor(scene, x, y, world, dynamic) {
        super(scene, x, y, world, dynamic, {
            standSprite: 540,
            deadSprite: 543,
            spriteAttack: 542,
            moveSprites: 539,
            dragX: playerDragX,
            maxVelocityX: plusMinus(0.05) * 45,
            maxVelocityY: plusMinus(0.02) * playerMaxVelocityY,
            health: 4,
            attackDelay: 700,
            jumpVelocity: -240,
            damage: 2,
            score: 50,
            scale: 1.0

        });
    }
}
export class Rat extends MeleeMonster {
    constructor(scene, x, y, world, dynamic) {
        super(scene, x, y, world, dynamic, {
            standSprite: 480,
            deadSprite: 481,
            spriteAttack: 477,
            moveSprites: 476,
            dragX: playerDragX,
            maxVelocityX: plusMinus(0.05) * 90,
            maxVelocityY: plusMinus(0.02) * playerMaxVelocityY,
            health: 1,
            attackDelay: 2000,
            jumpVelocity: -200,
            damage: 1,
            score: 10,
            scale: 0.75

        });
    }
}
export class Ice extends MeleeMonster {
    constructor(scene, x, y, world, dynamic) {
        super(scene, x, y, world, dynamic, {
            standSprite: 638,
            deadSprite: 643,
            spriteAttack: 639,
            moveSprites: 638,
            dragX: playerDragX,
            maxVelocityX: plusMinus(0.05) * 32,
            maxVelocityY: plusMinus(0.02) * playerMaxVelocityY,
            health: 2,
            attackDelay: 2000,
            jumpVelocity: -170,
            damage: 1,
            score: 25,
            scale: 1

        });
    }
}

class DeadMonster {
    constructor(sprite, config) {
        this._sprite = sprite;
        this.config = config;
    }

    update() {
        this._sprite.setTexture('player', this.config.deadSprite);
        this._sprite.setAccelerationX(0);
    }
}

class IdleMonster {

    constructor(sprite) {
        this._sprite = sprite;
        this._flipDelay = Math.random() * 400 + 800;
    }

    update({time, player, worlds}) {
        this._lastFlip = this._lastFlip || time;
        if (time - this._lastFlip > this._flipDelay) {
            this._lastFlip = time;
            this._sprite.setFlipX(!this._sprite.flipX);
        }
        const canSesPlayer = canSee(player.sprite, this._sprite, worlds, spiderViusualRange);
        if (canSesPlayer) {
            return 'attacking';
        } else {
            return null;
        }
    }
}

class CloseCombatAttackingMonster {

    constructor(sprite, gfx, config) {
        this.sprite = sprite;
        this.gfx = gfx;
        this.config = config;
    }

    update({time, player, worlds}) {
        const px = player.sprite.x;
        const mx = this.sprite.x;
        const dx = Math.abs(px - mx);
        const py = player.sprite.y;
        const my = this.sprite.y;
        const dy = Math.abs(py - my);

        const canReach = dx < 0.5 * tileSize && dy < 0.5 * tileSize;
        if (canReach) {
            this._attackPlayer({time, player});
        } else {
            this._runToPlayer({px, mx, dx, my, py, worlds});
        }
    }

    _attackPlayer({time, player}) {
        const canAttack = this._lastAttack === undefined || time - this._lastAttack > this.config.attackDelay;
        if (canAttack) {
            this._lastAttack = time;
            player.changeHealth(-this.config.damage);
            this.sprite.setTexture('player', this.config.spriteAttack);
        } else {
            const attacking = this._lastAttack && time - this._lastAttack < 250;
            this.sprite.setTexture('player', attacking ? this.config.spriteAttack : this.config.standSprite);
        }

    }

    _runToPlayer({px, mx, dx, my, py, worlds}) {
        const playerIsLeft = px - mx < 0;
        const playerIsLeftFactor = playerIsLeft ? -1 : 1;
        moveX(this.sprite, playerIsLeftFactor * playerAccelerationWalking);

        const obstacleSensorOffset = playerIsLeftFactor * 1.5 * tileSize;
        const holeSensorOffset = playerIsLeftFactor * 0.5 * tileSize;
        const canJump = this.sprite.body.blocked.down;
        const wantJump =
            // something is in the way
            approachesObstacle(this.sprite, obstacleSensorOffset, worlds)
            // there is a hole to jump over
            || approachesHole(this.sprite, holeSensorOffset, worlds)
            // player is above the monster
            || dx < tileSize && my - py > 1.5 * tileSize;
        if (wantJump && canJump) {
            this.sprite.setVelocityY(this.config.jumpVelocity);
        }

        this.sprite.setTexture('player', this.config.moveSprites);
        if (debugging) {
            this._updateRunToPlayerDebugging({x: px, y: py}, {obstacleSensorOffset, holeSensorOffset, worlds});
        }
    }

    _updateRunToPlayerDebugging(playerPosition, {obstacleSensorOffset, holeSensorOffset, worlds}) {
        const line = lineOfSight(playerPosition, this.sprite, spiderViusualRange);
        if (line) {
            const canSeePlayer = canSee(playerPosition, this.sprite, worlds, spiderViusualRange);
            this.gfx.lineStyle(1, canSeePlayer ? 0x33ff00 : 0xff3300)
                .strokeLineShape(line);
        }
        const oSensor = obstacleSensor(this.sprite, obstacleSensorOffset);
        if (oSensor) {
            this.gfx.fillStyle(0xbbbbff, 1)
                .fillCircleShape(new Phaser.Geom.Circle(oSensor.x, oSensor.y, 1));
        }
        const hSensor = holeSensor(this.sprite, holeSensorOffset);
        if (hSensor) {
            this.gfx.fillStyle(0xbbbbff, 1)
                .fillCircleShape(new Phaser.Geom.Circle(hSensor.x, hSensor.y, 1));
        }
    }
}
