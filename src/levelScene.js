import Player from './player.js';
import WorldHandling from './worldHandling.js';
import ObjectHandling from './objectHandling.js';
import { cameraZoom, debugging, tileSize } from './constants.js';
import DynamicsHandling from './dynamicsHandling.js';
import Projectile from './projectile.js';
import { monsterByName } from './monsters.js';
import Timer from './timer.js';
import ControlsToReset from './controlsToReset.js';

export default class LevelScene extends Phaser.Scene {

    constructor() {
        super({ key: 'level', active: true });
        this.timer = new Timer(this);
        this._currentLevel = 'Map2';
    }

    setLevel(level) {
        this._currentLevel = level;
        this.scene.restart();
    }

    preload() {
        this.load.spritesheet('player', 'assets/simples_pimples.png', {
            frameWidth: tileSize,
            frameHeight: tileSize,
            margin: 0,
            spacing: 0
        });
        this.load.image('tiles', 'assets/simples_pimples.png');
        
        // you can load a level from a JS object like this this.cache.tilemap.add('Test 1', { format: 1, data: test1Map });-        this.load.tilemapTiledJSON('debugging', `assets/debugging.json`);
        this.load.tilemapTiledJSON('tutorial', 'assets/tutorial.json');
        this.load.tilemapTiledJSON('tutorial2', 'assets/tutorial2.json');
        this.load.tilemapTiledJSON('tutorial3', 'assets/tutorial3.json');
        this.load.tilemapTiledJSON('01-forest-1', 'assets/01-forest-1.json');
        this.load.tilemapTiledJSON('Test 1', 'assets/Test 1.json');
        this.load.tilemapTiledJSON('Map2', 'assets/Map2.json');
        this.load.tilemapTiledJSON('Testing', 'assets/Testing.json');
    }

    create() {
        const map = this.map = this.make.tilemap({ key: this._currentLevel });
        const tiles = map.addTilesetImage('simples_pimples', 'tiles');

        /*
         * world layers
         */
        const background = map.createStaticLayer('Background', tiles, 0, 0);
        const world = this._world = map.createStaticLayer('World', tiles, 0, 0);
        world.setCollisionByProperty({ collides: true });
        const foreground = map.createStaticLayer('Foreground', tiles, 0, 0);
        foreground.setDepth(10);
        const dynamic = this._dynamic = map.createDynamicLayer('Dynamic', tiles, 0, 0);
        dynamic.setCollisionByProperty({ collides: true });
        if (debugging) {
            this._devMode(world);
            this._devMode(dynamic);
        }

        /*
         * player
         */
        const spawnPoint = map.findObject('Objects', obj => obj.name === 'Spawn Point');
        const score = this.player ? this.player.score : 0;
        this.player = new Player(this, spawnPoint.x, spawnPoint.y, { score }, this._createProjectile.bind(this));
        this._addCollider(this.player.sprite);

        /*
         * monsters
         */
        const monsterTiles = dynamic.filterTiles(t => t.properties['monster']);
        this.monsters = monsterTiles.map(t => {
            const factory = monsterByName[t.properties['monster']];
            return factory && factory(this, t.getCenterX(), t.getCenterY(), world, dynamic);
        }).filter(f => f);
        this.monsters.forEach(m => this._addCollider(m.sprite));
        monsterTiles.forEach(t => {
            dynamic.removeTileAt(t.x, t.y);
            t.destroy();
        });

        /*
         * moving stuff (i.e. projectiles)
         */
        this._projectiles = [];

        /*
         * camera
         */
        // zoom cannot be set via game config any more
        this.cameras.main.setZoom(cameraZoom);
        // follow player
        this.cameras.main.startFollow(this.player.sprite);
        // do not leave level while following
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        /*
         * objects, messages, ...
         */
        this.objectsHandling = new ObjectHandling(this, this.player, this.timer, map);
        this.dynamicsHandling = new DynamicsHandling(this.player, dynamic);
        this.worldHandling = new WorldHandling(this.player, world);

        /**
         * reset via gamepad
         */
        this.controlsToReset = new ControlsToReset(this);
    }

    _devMode(world) {
        // devMode
        const debugGraphics = this.add.graphics().setAlpha(0.75);
        world.renderDebug(debugGraphics, {
            tileColor: null, // Color of non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        });
    }

    _createProjectile(settings) {
        const projectile = new Projectile(
            { ...settings, scene: this }
        );
        this._addCollider(projectile.sprite);
        this._projectiles.push(projectile);
    }

    _addCollider(sprite) {
        this.physics.world.addCollider(sprite, this._world);
        this.physics.world.addCollider(sprite, this._dynamic);
    }

    update(time) {
        /**
         * reset game?
         */
        const { reset } = this.controlsToReset.getCurrectInput(time);
        if (reset) {
            window.location.reload();
        }

        /*
         * interaction with items in the world
         */
        this.worldHandling.update(time);
        this.objectsHandling.update(time);
        this.dynamicsHandling.update();

        /*
         * player and monsters
         */
        this.player.update(time);
        this.monsters.forEach(m => m.update(time, this.player));
        this.timer.update(time);

        /*
         * projectiles
         */
        this._updateProjectiles(time);

        /*
         * world bounds, death and respawn
         */
        this._enforceWorldBounds();
        this._deathAndRespawn(time);
    }

    _updateProjectiles(time) {
        const projectilesToDestroy = this._projectiles
            // !!! filter with side-effect !!!
            .filter(p => p.update(time, this.monsters));
        projectilesToDestroy.forEach(p => p.destroy());
        this._projectiles = this._projectiles.filter(p => !projectilesToDestroy.includes(p));
    }

    _enforceWorldBounds() {
        // player must stay in level (x-axis)
        this.player.sprite.x = Math.min(
            Math.max(
                this.player.sprite.x,
                tileSize / 2
            ),
            this.map.widthInPixels - tileSize / 2
        );

        // player dies when falling out of world (y-axis)
        if (this.player.sprite.y > this.map.heightInPixels) {
            this.player.changeHealth(-16 /* instant death */);
        }
    }

    _deathAndRespawn(time) {
        if (this.player.isAlive()) {
            this._timeOfDeath = undefined;
        } else {
            this._timeOfDeath = this._timeOfDeath || time;
            if (time - this._timeOfDeath > 3000) {
                this.scene.restart();
            }
        }
    }
}