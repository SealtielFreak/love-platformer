import { CollisionSystem, DirectionRect, Vector2 } from '@/collision';
import { Tile } from '@/dynamic/tile';
import DynamicEntity from '@/dynamic/entities/DynamicEntity';
import PrimitiveVector2 from '@/types/vector2';

type DirectionState = 'left' | 'right' | 'nothing';

interface Input {
    readonly Id: number;
    readonly direction: DirectionState;
    readonly jumping: boolean;
}

export function readInputControl(): Input {
    let direction: DirectionState = 'nothing';
    let jumping: boolean = false;

    if (love.keyboard.isDown('left', 'a')) {
        direction = 'left';
    } else if (love.keyboard.isDown('right', 'd')) {
        direction = 'right';
    }

    if (love.keyboard.isDown('up', 'w', 'space')) {
        jumping = true;
    } else if (love.keyboard.isDown('down', 's')) {
        // TO DO
    }

    return {
        Id: 0,
        direction: direction,
        jumping: jumping,
    };
}

export function moveController(
    dt: number = 1,
    speed: number = 1,
    dir: PrimitiveVector2 = [1, 1]
): Vector2 {
    const move = new Vector2();
    const deltaSpeed = speed * dt;

    if (dir[0] != 0) {
        if (love.keyboard.isDown('left', 'a')) {
            move.x -= deltaSpeed;
        } else if (love.keyboard.isDown('right', 'd')) {
            move.x += deltaSpeed;
        }
    }

    if (dir[1] != 0) {
        if (love.keyboard.isDown('up', 'w', 'space')) {
            // move.y -= deltaSpeed;
        } else if (love.keyboard.isDown('down', 's')) {
            // move.y += speedDelta;
        }
    }

    return move;
}

export function jumpController(dt: number = 1, speed: number = 1): Vector2 {
    const jump = new Vector2();

    if (love.keyboard.isDown('space', 'w')) {
    }

    return jump;
}

export function updateController(
    dt: number,
    player: DynamicEntity,
    move: Vector2,
    worldCollisionSystem: CollisionSystem<Tile>,
    size: PrimitiveVector2,
    level: Tile[]
) {
    if (player.y > size[1]) {
        player.position.assign(
            new Vector2(size[0] / 2, player.y % (size[1] + player.height))
        );
    }

    move.y += player.jumpGravity * dt;

    const [movePlayer, collisions] = worldCollisionSystem.move(
        move,
        player,
        (a: any, b: any) => {
            if ((b as Tile).id == 3) {
                return 'cross';
            }

            return 'slide';
        }
    );

    player.isGround = false;
    player.isSlipping = false;

    collisions.forEach((collision) => {
        const item = collision.other;

        if (item.id == 3) {
            const index = level.indexOf(item);

            if (index > -1) {
                level.splice(index, 1);
                worldCollisionSystem.remove(item);
                player.score++;
            }

            return;
        } else if (
            item.id == 4 &&
            [DirectionRect.left, DirectionRect.right].includes(
                collision.collisionItem as DirectionRect
            )
        ) {
            player.jumpGravity *= 0.25;
            player.isSlipping = true;
            player.isGround = true;
            player.isJump = false;
        } else {
            if (collision.collisionItem == DirectionRect.bottom) {
                player.isGround = true;
                player.jumpGravity = 0;
            } else if (collision.collisionItem == DirectionRect.top) {
                player.isJump = false;
                player.jumpGravity = 0;
            }
        }
    });

    if (love.keyboard.isDown('up', 'w', 'space')) {
        if (player.isGround) {
            player.isGround = false;
            player.isJump = true;
        }

        if (player.isJump && !player.isSlipping) {
            if (Math.abs(player.jumpGravity) >= player.speedJump * 0.075) {
                player.isJump = false;
            } else {
                player.jumpGravity -= player.speedJump * 0.75 * dt;
            }
        }
    } else {
        player.isJump = false;
    }

    if (!player.isGround) {
        player.jumpGravity += player.speedJump * 0.25 * dt;
    }

    player.position = movePlayer;

    return player;
}
