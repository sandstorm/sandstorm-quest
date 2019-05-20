/**
 * Detects if the player is climbing (or swimming) and
 * alters the impact of the gravitation to the player accordingly.
 */
export default class WorldHandling {

    /**
     * constructor
     *
     * @param player the player affected by the world
     * @param world game layer to analyze
     */
    constructor(player, world) {
        this.player = player;
        this.world = world;
    }

    /**
     * Updates the effect of gravity on the given player
     * and returns whether it is the default gravity or not.
     *
     * @returns {boolean} true if the gravity is special (eg during climbing or swimming), false if it is ordinary
     */
    update(time) {
        const {x, y, height} = this.player.sprite;
        const tileBody = this.world.getTileAtWorldXY(x, y);
        const tileFeed = this.world.getTileAtWorldXY(x, y + (height / 2) + 2);

        // standing on top of ladders counts as staying on a ladder (same for liquids)
        // otherwise movement feels incorrect
        if (this._getFirstProperty([tileBody, tileFeed], 'isLadder', false)) {
            this._applyTiles(time, [tileBody, tileFeed]);
        } else if (this._getFirstProperty([tileBody, tileFeed], 'isLiquid', false)) {
            this._applyTiles(time, [tileBody, tileFeed]);
        } else {
            this._applyTiles(time, [tileBody]);
        }
    }

    _applyTiles(time, tiles) {
        this._applyGravity(tiles);
        this._applyHeals(time, tiles);
    }

    _applyGravity(tiles) {
        // in order to make swimming and climbing more easy, we reduce the gravity if the center of the player is over ladders/liquids as well
        const localGravity = this._getFirstProperty(tiles, 'gravity', 1);
        this.player.setGravityPercentage(localGravity);
        return localGravity;
    }

    _applyHeals(time, tiles) {
        const delta = this._getFirstProperty(tiles, 'heals', undefined);
        if (delta) {
            if (this._lastHealthDelta !== delta || time - this._lastHealthUpdateTime > 500) {
                this._lastHealthDelta = delta;
                this._lastHealthUpdateTime = time;
                this.player.changeHealth(delta);
            }
        }
    }

    _getFirstProperty(tiles, property, defaultValue) {
        const properties = tiles.filter(t => t && t.properties[property] !== undefined).map(t => t.properties[property]);
        return properties.length > 0 ? properties[0] : defaultValue;
    }

}