export default class DynamicsHandling {

    constructor(player, dynamic) {
        this.player = player;
        this.dynamic = dynamic;
    }

    update() {
        const {x, y} = this.player.sprite;
        const tile = this.dynamic.getTileAtWorldXY(x, y);
        if (tile) {
            if (tile.properties.opens !== undefined) {
                this._openLocks(tile.properties.opens);
            }
            if (tile.properties.heals !== undefined) {
                this.player.changeHealth(tile.properties.heals);
            }
            if (tile.properties.pays !== undefined) {
                this.player.changeScore(tile.properties.pays);
            }
            this.dynamic.removeTileAtWorldXY(x, y);
            tile.destroy();
        }
    }

    _openLocks(lockName) {
        const locks = this.dynamic.filterTiles(
            t => t.properties.name === lockName
        );
        for (let lock of locks) {
            lock.setCollision(false, false, false, false);
            lock.setAlpha(0.5);
        }
    }
}