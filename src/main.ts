import {
    closureCallableGenerator,
    ClosurePrintLine,
} from './utilities/utilities';
import {
    CollisionSystem,
    DirectionRect,
    LinearCollision,
    Rect,
    Vector2,
} from './collision';
import { moveController } from './controlls';
import { Canvas } from 'love.graphics';

function rangeAxis2D(x: number, y: number): number[][] {
    let arr = [];

    for (let _y = 0; _y < y; _y++) {
        for (let _x = 0; _x < x; _x++) {
            arr.push([_x, _y]);
        }
    }

    return arr;
}

// 16x16
const levelMap = [
    4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 3, 0, 4, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1, 4, 0, 0, 4, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 1, 4, 0,
    0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 0, 0, 4, 0, 0, 2, 2, 2, 0, 0,
    0, 1, 1, 1, 1, 4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 0, 0, 4,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 0, 3, 4, 0, 0, 0, 0, 0, 0, 2, 2, 2,
    0, 0, 1, 4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 0, 0, 4, 0, 0,
    0, 0, 0, 3, 0, 0, 0, 0, 0, 1, 4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1, 4, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 0, 0, 0, 0, 1, 4, 3, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 1, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1,
];

const random = love.math.random;
const direcction: string[] = [];

/* World variables */
const speedGravity = 2000;

/* Player variables */
let player: Player;
let jumpGravity = speedGravity;
let score = 0;
let moveSpeed = 250;
let isGround = false;
let isJump = false;
let isSlipling = false;

const speedJump = speedGravity * 4;

/* Game variables */
let level: Tile[];
let sizeWindows: [number, number];
let worldCollisionSystem: CollisionSystem<Tile>;
const backgroundColor: [number, number, number] = rgbGenerator(92, 164, 240);

const generateCanvas = (inner: () => void) => {
    const canvas: Canvas = love.graphics.newCanvas();

    love.graphics.setCanvas(canvas);
    inner();
    love.graphics.setCanvas();

    return canvas;
};

const randomColor: () => [number, number, number] = () => [
    random(255) / 255,
    random(255) / 255,
    random(255) / 255,
];

function rgbGenerator(
    r: number,
    g: number,
    b: number
): [number, number, number] {
    return [r / 255, g / 255, b / 255];
}

class Tile extends Rect {
    public color: [number, number, number];

    constructor(
        position: Vector2,
        size: Vector2,
        id: number,
        color?: [number, number, number]
    ) {
        super(position, size);

        if (typeof color == 'undefined') {
            color = randomColor();
        }

        this.color = color;
        this._id = id;
    }

    private _id: number;

    get id(): number {
        return this._id;
    }
}

class Player extends Rect {
    public color: [number, number, number];
    private _moveSpeed: number;

    constructor(position: Vector2, size: Vector2) {
        super(position, size);

        this.color = [1, 1 / 2, 0];
        this._moveSpeed = 250;
        this._isGravity = false;
        this._isJump = false;
        this._isSliping = false;
    }

    private _isGravity: boolean;

    get isGravity(): boolean {
        return this._isGravity;
    }

    private _isJump: boolean;

    get isJump(): boolean {
        return this._isJump;
    }

    private _isSliping: boolean;

    get isSliping(): boolean {
        return this._isSliping;
    }
}

love.load = () => {
    const size = love.window.getMode();
    const colors: Array<[number, number, number]> = [];

    sizeWindows = [size[0], size[1]];
    worldCollisionSystem = new LinearCollision<Tile>();
    player = new Player(
        new Vector2(sizeWindows[0] / 2, 0),
        new Vector2(24, 48)
    );
    level = [];

    colors[1] = rgbGenerator(98, 205, 252);
    colors[2] = rgbGenerator(101, 217, 230);
    colors[3] = rgbGenerator(105, 255, 237);
    colors[4] = rgbGenerator(94, 242, 192);
    colors[5] = rgbGenerator(114, 110, 255);

    rangeAxis2D(16, 16).forEach((v, i) => {
        const id = levelMap[i];
        const size = 30;
        const item = new Tile(
            new Vector2(v[0] * size, v[1] * size),
            new Vector2(size, size),
            id
        );

        if (id > 0) {
            item.color = colors[id];
            level.push(item);
        }
    });

    level.forEach((item) => worldCollisionSystem.add(item));

    direcction[DirectionRect.bottom] = 'Bottom';
    direcction[DirectionRect.top] = 'Top';
    direcction[DirectionRect.left] = 'Left';
    direcction[DirectionRect.right] = 'Right';
};

love.update = (dt: number) => {
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

    let [movePlayer, collisions] = worldCollisionSystem.move(
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
        let item = collision.other;

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
};

love.draw = () => {
    const screenSize = new Vector2(...sizeWindows);
    const printLn = closureCallableGenerator(
        new ClosurePrintLine(new Vector2(0, 0), 12)
    );

    love.graphics.setBackgroundColor(backgroundColor);

    love.graphics.translate(
        -(player.width / 2 + player.x) + screenSize.x / 2,
        -(player.height / 2 + player.y) + screenSize.y / 2
    );

    love.graphics.setColor(...player.color);
    love.graphics.rectangle(
        'fill',
        player.x,
        player.y,
        player.width,
        player.height
    );

    level.forEach((item) => {
        love.graphics.setColor(...item.color);
        love.graphics.rectangle(
            'fill',
            item.x,
            item.y,
            item.width,
            item.height
        );
    });

    love.graphics.translate(
        player.width / 2 + player.x - screenSize.x / 2,
        player.height / 2 + player.y - screenSize.y / 2
    );
    love.graphics.setColor(1, 1, 0);

    printLn('FPS: ' + love.timer.getFPS());
    printLn(`Position: [${Math.floor(player.x)}, ${Math.floor(player.y)}]`);
    printLn('Score: ' + score);

    if (isJump) {
        printLn('Move jump: ' + Math.floor(jumpGravity * -1));
        printLn('Player is jumping');
    } else {
        printLn('Player is in ground');
    }

    if (isSlipling) {
        printLn('Player is sliping');
    }
};
