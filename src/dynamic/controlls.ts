import { CollisionSystem, DirectionRect, Rect, Vector2 } from '@/collision';
import { Tile } from '@/dynamic/tile';
import DynamicEntity from '@/dynamic/entities/DynamicEntity';
import PrimitiveVector2 from '@/types/vector2';

interface Input {
    readonly id: number;
    readonly direction: number;
    readonly jumping: boolean;
}

export function readInputControl(): Input {
    let direction = 0;
    let jumping = false;

    if (love.keyboard.isDown('left', 'a')) {
        direction = -1;
    } else if (love.keyboard.isDown('right', 'd')) {
        direction = 1;
    }

    if (love.keyboard.isDown('up', 'w', 'space')) {
        jumping = true;
    } else if (love.keyboard.isDown('down', 's')) {
        // TO DO
    }

    return {
        id: 0,
        direction: direction,
        jumping: jumping,
    };
}

export function moveEntity(
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
        if (love.keyboard.isDown('up', 'w')) {
            move.y -= deltaSpeed;
        } else if (love.keyboard.isDown('down', 's')) {
            // move.y += speedDelta;
        }
    }

    return move;
}

export function updateEntityFromWorld(
    dt: number,
    entity: DynamicEntity,
    move: Vector2,
    worldCollisionSystem: CollisionSystem<Tile>,
    size: PrimitiveVector2,
    level: Tile[]
) {
    if (entity.y > size[1]) {
        entity.position.assign(
            new Vector2(size[0] / 2, entity.y % (size[1] + entity.height))
        );
    }

    move.y += entity.jumpGravity * dt;

    const [movePlayer, collisions] = worldCollisionSystem.move(
        move,
        entity,
        <T>(a: T, b: T) => {
            if ((b as Tile).id == 3) {
                return 'cross';
            }

            return 'slide';
        }
    );

    entity.isGround = false;
    entity.isSlipping = false;

    collisions.forEach((collision) => {
        const item = collision.other;

        if (item.id == 3) {
            const index = level.indexOf(item);

            if (index > -1) {
                level.splice(index, 1);
                worldCollisionSystem.remove(item);
                entity.score++;
            }

            return;
        } else if (
            item.id == 4 &&
            [DirectionRect.left, DirectionRect.right].includes(
                collision.collisionItem as DirectionRect
            )
        ) {
            entity.jumpGravity *= 0.25;
            entity.isSlipping = true;
            entity.isGround = true;
            entity.isJump = false;
        } else {
            if (collision.collisionItem == DirectionRect.bottom) {
                entity.isGround = true;
                entity.jumpGravity = 0;
            } else if (collision.collisionItem == DirectionRect.top) {
                entity.isJump = false;
                entity.jumpGravity = 0;
            }
        }
    });

    if (love.keyboard.isDown('up', 'w', 'space')) {
        if (entity.isGround) {
            entity.isGround = false;
            entity.isJump = true;
        }

        if (entity.isJump && !entity.isSlipping) {
            if (Math.abs(entity.jumpGravity) >= entity.speedJump * 0.075) {
                entity.isJump = false;
            } else {
                entity.jumpGravity -= entity.speedJump * 0.75 * dt;
            }
        }
    } else {
        entity.isJump = false;
    }

    if (!entity.isGround) {
        entity.jumpGravity += entity.speedJump * 0.25 * dt;
    }

    entity.position = movePlayer;

    return entity;
}
