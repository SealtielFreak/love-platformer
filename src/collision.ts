import { ArithmeticObject } from '@/utils/objects/arithmetic';
import { ReferenceObject } from '@/utils/objects/reference';
import { StringObject } from '@/utils/objects/string';

/* Types */
export type ResponseDictionary = Map<
    string,
    <T extends Rect>(goal: Vector2, a: T, b: T) => void
>;
export type ResponseFuntion = <T extends Rect>(
    goal: Vector2,
    a: T,
    b: T
) => void;
export type FilterFunction = <T extends Rect>(a: T, b: T) => string;

export enum DirectionRect {
    top,
    bottom,
    left,
    right,
}

/* Response collision list */
//const touchResponse: ResponseFuntion
const crossResponse: ResponseFuntion = (goal, a, b) => {};

//const bounceResponse: ResponseFuntion
const slideResponse: ResponseFuntion = <T extends Rect>(
    goal: Vector2,
    a: T,
    b: T
) => {
    if (isOverloadRect(a, b)) {
        if (goal.x > 0) {
            a.right = b.left;
        } else if (goal.x < 0) {
            a.left = b.right;
        }
    }

    if (isOverloadRect(a, b)) {
        if (goal.y > 0) {
            a.bottom = b.top;
        } else if (goal.y < 0) {
            a.top = b.bottom;
        }
    }
};

const emptyResponse: ResponseFuntion = <T extends Rect>(
    goal: Vector2,
    a: T,
    b: T
) => {};

const defaultResponseDictionary: ResponseDictionary = new Map();

//defaultResponseDictionary.set('touch', touchResponse)
defaultResponseDictionary.set('cross', crossResponse);
//defaultResponseDictionary.set('bounce', bounceResponse)
defaultResponseDictionary.set('slide', slideResponse);
defaultResponseDictionary.set('', emptyResponse);

const resolveAxisCollisition = <T extends Rect>(
    responses: ResponseDictionary,
    goal: Vector2,
    current: T,
    others: T[],
    filter?: FilterFunction
): ColisionInformation<T>[] => {
    const collisions: ColisionInformation<T>[] = [];
    const innerFilter = filter || ((a: T, b: T) => 'slide');

    current.move(goal);

    others.forEach((other) => {
        if (isOverloadRect(current, other)) {
            const nameResponse = innerFilter(current, other);
            const response = responses.get(nameResponse) || emptyResponse;

            const collisionGenerator = new CollisionInformationGenerator(
                current,
                other
            );

            collisionGenerator.collisionItem = detectOverloadRect(
                goal,
                current,
                other
            );
            collisionGenerator.collisionOther = detectOverloadRect(
                goal.mul(new Vector2(-1, -1)),
                other,
                current
            );

            collisionGenerator.response = nameResponse;

            response(goal, current, other);

            collisionGenerator.overlaps = isOverloadRect(current, other);

            collisions.push(collisionGenerator.generateInformation());
        }
    });

    return collisions;
};

/* Auxiliar functions */
function resolveCollision<T extends Rect>(
    responses: ResponseDictionary,
    goal: Vector2,
    current: T,
    others: T[],
    filter?: FilterFunction
): ColisionInformation<T>[] {
    const [x, y] = [goal.x, goal.y];
    let collisions: ColisionInformation<T>[] = [];

    collisions = collisions.concat(
        resolveAxisCollisition(
            responses,
            new Vector2(...[x, 0]),
            current,
            others,
            filter
        )
    );
    collisions = collisions.concat(
        resolveAxisCollisition(
            responses,
            new Vector2(...[0, y]),
            current,
            others,
            filter
        )
    );

    return collisions;
}

const wasVerticallyAligned = (a: Rect, b: Rect): boolean => {
    return a.top < b.bottom && a.bottom > b.top;
};

const wasHorizontalAligned = (a: Rect, b: Rect): boolean => {
    return a.left < b.right && a.right > b.left;
};

export function detectOverloadRect(
    goal: Vector2,
    a: Rect,
    b: Rect
): DirectionRect | undefined {
    let direction: DirectionRect | undefined;

    if (wasHorizontalAligned(a, b)) {
        if (goal.x > 0) {
            direction = DirectionRect.right;
        } else if (goal.x < 0) {
            direction = DirectionRect.left;
        }
    }

    if (wasVerticallyAligned(a, b)) {
        if (goal.y > 0) {
            direction = DirectionRect.bottom;
        } else if (goal.y < 0) {
            direction = DirectionRect.top;
        }
    }

    return direction;
}

export function isOverloadRect(a: Rect, b: Rect): boolean {
    return wasVerticallyAligned(a, b) && wasHorizontalAligned(a, b);
}

/* Entity classes */
export class Vector2
    implements ReferenceObject<Vector2>, ArithmeticObject, StringObject
{
    constructor(
        public x: number = 0,
        public y: number = 0
    ) {}

    assign(other: Vector2): void {
        this.x = other.x;
        this.y = other.y;
    }

    equals(...others: Vector2[]): boolean {
        for (const other of others) {
            if (this.x == other.x && this.y == other.y) {
                return true;
            }
        }

        return false;
    }

    add(...others: Vector2[]): Vector2 {
        const result = new Vector2(this.x, this.y);

        others.forEach((other) => {
            result.x += other.x;
            result.y += other.y;
        });

        return result;
    }

    sub(...others: Vector2[]): Vector2 {
        const result = new Vector2(this.x, this.y);

        others.forEach((other) => {
            result.x -= other.x;
            result.y -= other.y;
        });

        return result;
    }

    mul(...others: Vector2[]): Vector2 {
        const result = new Vector2(this.x, this.y);

        others.forEach((other) => {
            result.x *= other.x;
            result.y *= other.y;
        });

        return result;
    }

    div(...others: Vector2[]): Vector2 {
        const result = new Vector2(this.x, this.y);

        others.forEach((other) => {
            result.x /= other.x;
            result.y /= other.y;
        });

        return result;
    }

    pow(...others: Vector2[]): Vector2 {
        const result = new Vector2(this.x, this.y);

        others.forEach((other) => {
            result.x = result.x ** other.x;
            result.y = result.y ** other.y;
        });
        return result;
    }

    toTuple(): [number, number] {
        return [this.x, this.y];
    }

    toString() {
        return `x: ${this.x}, y: ${this.y}`;
    }
}

export class Rect implements ReferenceObject<Rect>, StringObject {
    private __position: Vector2;
    private __size: Vector2;

    constructor(position: Vector2, size: Vector2) {
        this.__position = new Vector2(position.x, position.y);
        this.__size = new Vector2(size.x, size.y);
    }

    get position(): Vector2 {
        return this.__position;
    }

    set position(position: Vector2) {
        this.__position = position;
    }

    get size(): Vector2 {
        return this.__size;
    }

    set size(size: Vector2) {
        this.__size = size;
    }

    get x(): number {
        return this.__position.x;
    }

    set x(x: number) {
        this.__position.x = x;
    }

    get y(): number {
        return this.__position.y;
    }

    set y(y: number) {
        this.__position.y = y;
    }

    get width(): number {
        return this.__size.x;
    }

    get height(): number {
        return this.__size.y;
    }

    get top(): number {
        return this.y;
    }

    set top(top: number) {
        this.__position.y = top;
    }

    get bottom(): number {
        return this.y + this.height;
    }

    set bottom(bottom: number) {
        this.__position.y += bottom - this.bottom;
    }

    get left(): number {
        return this.x;
    }

    set left(left: number) {
        this.__position.x = left;
    }

    get right(): number {
        return this.x + this.width;
    }

    set right(right: number) {
        this.__position.x += right - this.right;
    }

    assign(other: Rect): void {
        this.__position = other.__position;
        this.__size = other.__size;
    }

    equals(...others: Rect[]): boolean {
        for (const other of others) {
            if (
                this.__position.equals(other.__position) &&
                this.__size.equals(other.__size)
            ) {
                return true;
            }
        }

        return false;
    }

    move(position: Vector2) {
        this.__position.x += position.x;
        this.__position.y += position.y;
    }

    toString(): string {
        return `[x: ${this.x}, y: ${this.y}, w: ${this.width}, h: ${this.height}]`;
    }
}

/* Collision info */
class CollisionInformationGenerator<T extends Rect> {
    private __response: string = '';
    private __overlaps: boolean = false;
    private __collisionItem: DirectionRect | undefined;
    private __collisionOther: DirectionRect | undefined;

    constructor(
        private item: T,
        private other: T
    ) {}

    set collisionItem(direcction: DirectionRect | undefined) {
        this.__collisionItem = direcction;
    }

    set collisionOther(direcction: DirectionRect | undefined) {
        this.__collisionOther = direcction;
    }

    set response(name: string) {
        this.__response = name;
    }

    set overlaps(overlaps: boolean) {
        this.__overlaps = overlaps;
    }

    generateInformation(): ColisionInformation<T> {
        return {
            item: this.item,
            other: this.other,

            response: this.__response,
            overlaps: this.__overlaps,

            collisionItem: this.__collisionItem,
            collisionOther: this.__collisionOther,
        };
    }
}

export interface ColisionInformation<T extends Rect> {
    /*
    cols[i] = {
        item  = the item being moved / checked
        other = an item colliding with the item being moved
    
        type  = the result of `filter(other)`. It's usually "touch", "cross", "slide" or "bounce"
        overlaps  = boolean. True if item "was overlapping" other when the collision started.
                    False if it didn't but "tunneled" through other
    
        ti        = Number between 0 and 1. How far along the movement to the goal did the collision occur>
    
        move      = Vector({x=number,y=number}). The difference between the original coordinates and the actual ones.
        normal    = Vector({x=number,y=number}). The collision normal; usually -1,0 or 1 in `x` and `y`
        touch     = Vector({x=number,y=number}). The coordinates where item started touching other
    
        itemRect  = The rectangle item occupied when the touch happened({x = N, y = N, w = N, h = N})
        otherRect = The rectangle other occupied when the touch happened({x = N, y = N, w = N, h = N})
    }
    */

    readonly item: T;
    readonly other: T;

    readonly response: string;
    readonly overlaps: boolean;

    // readonly lastPosition: Vector2
    // readonly recentPosition: Vector2
    // readonly lastMove: Vector2

    readonly collisionItem: DirectionRect | undefined;
    readonly collisionOther: DirectionRect | undefined;
}

/* SystemCollisions classes */
export interface CollisionSystem<T extends Rect> {
    clear(): void;

    add(item: T): void;

    remove(item: T): void;

    move(
        move: Vector2,
        current: Rect,
        filter?: FilterFunction
    ): [Vector2, ColisionInformation<T>[]];

    setResponse(name: string, response: ResponseFuntion): void;

    get items(): T[];
}

export class LinearCollision<T extends Rect> implements CollisionSystem<T> {
    protected __items: Set<T>;
    protected __responses: ResponseDictionary;

    constructor() {
        this.__items = new Set();
        this.__responses = new Map(defaultResponseDictionary);
    }

    get items(): T[] {
        return [...this.__items.values()];
    }

    clear() {
        this.__items.clear();
    }

    add(item: T) {
        this.__items.add(item);
    }

    remove(item: T) {
        this.__items.delete(item);
    }

    move(
        move: Vector2,
        current: T,
        filter?: FilterFunction
    ): [Vector2, ColisionInformation<T>[]] {
        const rect = new Rect(current.position, current.size);
        const collisions = resolveCollision(
            this.__responses,
            move,
            rect,
            this.items,
            filter
        );

        return [rect.position, collisions as ColisionInformation<T>[]];
    }

    setResponse(name: string, response: ResponseFuntion) {
        this.__responses.set(name, response);
    }
}

// export class LinearSortCollision implements CollisionSystem {}

// export class TreeCollision implements CollisionSystem {}
