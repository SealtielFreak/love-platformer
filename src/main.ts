import { CreateClosureCallable, PrintLineGenerator } from '@utils/utilities';
import { CollisionSystem, LinearCollision, Vector2 } from '@/collision';
import { rangeAxis2D } from '@utils/generator';
import { createColor } from '@utils/colors';
import { Tile } from '@/dynamic/tile';
import { moveController, updateController } from '@/dynamic/controlls';
import RGB from '@/types/color';
import Color from '@/types/color';
import DynamicEntity from '@/dynamic/entities/DynamicEntity';

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

const direction: string[] = [];

/* World variables */
const defaultColor: RGB = [1, 1 / 2, 0];
const defaultSpeedGravity = 2000;
const defaultMoveSpeed = 250;

/* Player variables */
let player: DynamicEntity;

/* Game variables */
let level: Tile[];
let sizeWindows: [number, number];
let worldCollisionSystem: CollisionSystem<Tile>;
const backgroundColor: [number, number, number] = createColor(92, 164, 240);

/**/
let moving = new Vector2();

love.load = () => {
    const size = love.window.getMode();
    const colors: Array<Color> = [];

    level = [];
    sizeWindows = [size[0], size[1]];
    worldCollisionSystem = new LinearCollision<Tile>();
    player = new DynamicEntity(
        new Vector2(sizeWindows[0] / 2, 0),
        new Vector2(24, 48),
        defaultSpeedGravity,
        defaultMoveSpeed,
        defaultColor
    );

    player.jumpGravity = defaultSpeedGravity;
    player.moveSpeed = defaultMoveSpeed;

    colors[1] = createColor(98, 205, 252);
    colors[2] = createColor(101, 217, 230);
    colors[3] = createColor(105, 255, 237);
    colors[4] = createColor(94, 242, 192);
    colors[5] = createColor(114, 110, 255);

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
};

love.update = (dt: number) => {
    let move = new Vector2();
    move = move.add(moveController(dt, defaultMoveSpeed, [1, 1]));

    player = updateController(
        dt,
        player,
        move,
        worldCollisionSystem,
        sizeWindows,
        level
    );

    moving = move;
};

love.draw = () => {
    const screenSize = new Vector2(...sizeWindows);
    const printLn = CreateClosureCallable(
        new PrintLineGenerator(new Vector2(0, 0), 12)
    );

    love.graphics.setBackgroundColor(backgroundColor);

    love.graphics.translate(
        -(player.width / 2 + player.x) + screenSize.x / 2,
        -(player.height / 2 + player.y) + screenSize.y / 2
    );

    const [r, g, b] = player.color;

    love.graphics.setColor(r, g, b);
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
    printLn('Score: ' + player.score);

    if (player.isJump) {
        printLn('Move jump: ' + Math.floor(player.jumpGravity * -1));
        printLn('Player is jumping');
    } else {
        printLn('Player is in ground');
    }

    if (player.isSlipping) {
        printLn('Player is sliping');
    }

    printLn(`Moving: [${Math.floor(moving.x)}, ${Math.floor(moving.y)}]`);
};
