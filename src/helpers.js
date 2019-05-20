export function distance(pointA, pointB) {
    return length({
        x: pointA.x - pointB.x,
        y: pointA.y - pointB.y
    });
}

export function length({x, y}) {
    return Math.sqrt(x * x + y * y);
}

export function canSee(pointA, pointB, worlds, visualRange = undefined) {
    const line = lineOfSight(pointA, pointB, visualRange);
    if (line) {
        for (let world of worlds) {
            const tiles = world.getTilesWithinShape(line);
            if (tiles.filter(t => t.collides).length > 0) {
                return false;
            }
        }
        return true;
    } else {
        return false;
    }
}

export function lineOfSight(pointA, pointB, visualRange = undefined) {
    if (visualRange && distance(pointA, pointB) > visualRange) {
        return null;
    } else {
        return new Phaser.Geom.Line(
            pointA.x, pointA.y,
            pointB.x, pointB.y
        );
    }
}

export function approachesObstacle(sprite, offset, worlds) {
    return !canSee(sprite, obstacleSensor(sprite, offset), worlds);
}

export function obstacleSensor(sprite, offset) {
    return {
        x: sprite.x + offset,
        y: sprite.y
    };
}

export function approachesHole(sprite, offset, worlds) {
    return !isSolidAt(holeSensor(sprite, offset), worlds);
}

export function holeSensor(sprite, offset) {
    return {
        x: sprite.x + offset,
        y: sprite.y + sprite.height
    };
}

function isSolidAt({x, y}, worlds) {
    for (let world of worlds) {
        const tile = world.getTileAtWorldXY(x, y);
        if (tile && tile.collides) {
            return true;
        }
    }
    return false;
}

export function moveX(sprite, acceleration) {
    const vx = sprite.body.velocity.x;
    const reverseDirection = vx !== 0 && Math.sign(vx) !== Math.sign(acceleration);
    sprite.setAccelerationX(reverseDirection ? 0 : acceleration);
    // make player watch left or right (default)
    sprite.setFlipX(acceleration < 0);
}