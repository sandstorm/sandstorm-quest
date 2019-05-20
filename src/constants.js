/**
 * development
 */

export const debugging = false;

/**
 * tiles
 */

export const playerStand = 76;
export const playerJump = 77;
export const playerRun = 78;
export const playerDead = 81;
export const heartFull = 2777;
export const heart3of4 = 2778;
export const heartHalf = 2779;
export const heart1of4 = 2780;
export const heartEmpty = 2776;
export const projectileSmallSpawn = 2652;
export const projectileSmallFlight = 2652;
export const projectileSmallFade = 2653;
export const projectileFatSpawn = 2600;
export const projectileFatFlight = 2602;
export const projectileFatFade = 2603;

/**
 * map
 */

export const objectsLayer = 'Objects';
export const tileSize = 16;

/**
 * scene
 */

export const cameraWidth = 20 * tileSize;
export const cameraHeight = 11 * tileSize;
export const cameraZoom = 3;
export const canvasWidth = cameraZoom * cameraWidth;
export const canvasHeight = cameraZoom * cameraHeight;

/**
 * movement
 */

export const gravity = 725;
export const playerMaxVelocityX = 7 * tileSize;
export const playerMaxVelocityY = 400;
export const playerDragX = 1000;
export const playerAccelerationWalking = 250;
export const playerJumpVelocity = playerMaxVelocityY;
export const playerAccelerationAirborne = 200;
export const playerAccelerationClimbingOrSwimming = 7 * tileSize;
export const playerClimbOrSwimVelocity = 150;
export const projectileSpeed = 10 * tileSize;
export const fireInterval = 250;
export const projectileMaxDistance = 9 * tileSize;
export const projectileSpwanDuration = 100;
export const projectileFadeDuration = 100;

