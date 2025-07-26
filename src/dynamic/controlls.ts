import { CollisionSystem, DirectionRect, Rect, Vector2 } from '@/collision';
import { Tile } from '@/dynamic/tile';
import RGB from '@/types/color';

export function moveController(
    dt: number = 1,
    speed: number = 1,
    dir: [number, number] = [1, 1]
): Vector2 {
    const move = new Vector2();
    speed *= dt;

    if (dir[0] != 0) {
        if (love.keyboard.isDown('left', 'a')) {
            move.x -= 1 * speed;
        } else if (love.keyboard.isDown('right', 'd')) {
            move.x += 1 * speed;
        }
    }

    if (dir[1] != 0) {
        if (love.keyboard.isDown('up', 'w')) {
            move.y -= 1 * speed;
        } else if (love.keyboard.isDown('down', 's')) {
            move.y += 1 * speed;
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

export class Player extends Rect {
    public color: RGB;
    public isGravity: boolean;
    public isJump: boolean;
    public isGround: boolean;
    public isSlipping: boolean;
    public moveSpeed: number;
    public jumpGravity: number;
    public score: number;
    public speedJump: number;

    constructor(
        position: Vector2,
        size: Vector2,
        speedGravity: number,
        moveSpeed: number,
        color: RGB
    ) {
        super(position, size);

        this.color = color;
        this.moveSpeed = moveSpeed;
        this.isGravity = false;
        this.isJump = false;
        this.isGround = false;
        this.isSlipping = false;
        this.jumpGravity = 0;
        this.score = 0;
        this.speedJump = speedGravity * 4;
    }
}

export function updateController(
    dt: number,
    player: Player,
    move: Vector2,
    worldCollisionSystem: CollisionSystem<Tile>,
    size: [number, number],
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

    if (love.keyboard.isDown('w', 'up', 'space')) {
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
