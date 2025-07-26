import { DirectionRect, Vector2 } from '@/collision';

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

class Player extends Rect {
    public color: [number, number, number];
    public readonly isGravity: boolean;
    public readonly isJump: boolean;
    public readonly isSliping: boolean;
    private readonly moveSpeed: number;

    constructor(position: Vector2, size: Vector2) {
        super(position, size);

        this.color = [1, 1 / 2, 0];
        this.moveSpeed = 250;
        this.isGravity = false;
        this.isJump = false;
        this.isSliping = false;
    }
}

export function updateControll(player: Player) {
    let move = new Vector2();

    move = move.add(moveController(dt, moveSpeed, [1, 0]));

    if (player.y > sizeWindows[1]) {
        player.position.assign(
            new Vector2(
                sizeWindows[0] / 2,
                player.y % (sizeWindows[1] + player.height)
            )
        );
    }

    move.y += jumpGravity * dt;

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

    isGround = false;
    isSlipling = false;

    collisions.forEach((collision) => {
        const item = collision.other;

        if (item.id == 3) {
            const index = level.indexOf(item);

            if (index > -1) {
                level.splice(index, 1);
                worldCollisionSystem.remove(item);
                score++;
            }

            return;
        } else if (
            item.id == 4 &&
            [DirectionRect.left, DirectionRect.right].includes(
                collision.collisionItem as DirectionRect
            )
        ) {
            jumpGravity *= 0.25;
            isSlipling = true;
            isGround = true;
            isJump = false;
        } else {
            if (collision.collisionItem == DirectionRect.bottom) {
                isGround = true;
                jumpGravity = 0;
            } else if (collision.collisionItem == DirectionRect.top) {
                isJump = false;
                jumpGravity = 0;
            }
        }
    });

    if (love.keyboard.isDown('w', 'up', 'space')) {
        if (isGround) {
            isGround = false;
            isJump = true;
        }

        if (isJump && !isSlipling) {
            if (Math.abs(jumpGravity) >= speedJump * 0.075) {
                isJump = false;
            } else {
                jumpGravity -= speedJump * 0.75 * dt;
            }
        }
    } else {
        isJump = false;
    }

    if (!isGround) {
        jumpGravity += speedJump * 0.25 * dt;
    }

    player.position = movePlayer;

    return player;
}
