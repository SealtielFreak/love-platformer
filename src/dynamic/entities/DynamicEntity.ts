import { Rect, Vector2 } from '@/collision';
import RGB from '@/types/color';

class DynamicEntity extends Rect {
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

export default DynamicEntity;
