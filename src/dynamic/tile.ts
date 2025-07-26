import { Rect, Vector2 } from '@/collision';
import { randomColor } from '@utils/colors';

export class Tile extends Rect {
    public color: [number, number, number];
    public readonly id: number;

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
        this.id = id;
    }
}
