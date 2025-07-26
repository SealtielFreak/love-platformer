import { Vector2 } from '@/collision';

export interface ObjectCallable {
    call(...args: any[]): void;
}

export const diference = (a: number, b: number): number => Math.abs(b - a);

export function range(a: number, b?: number): number[] {
    if (typeof b == 'undefined') {
        [a, b] = [0, a];
    }

    const arr: number[] = [];
    const length = diference(a, b);

    for (let i = 0; i < length; i++, a++) {
        arr[i] = a;
    }

    return arr;
}

export function printArray<T>(arr: T[]): string {
    let str = '[';

    for (let i = 0; i < arr.length; i++) {
        str += `${i}`;

        if (i < arr.length - 1) {
            str += ', ';
        }
    }

    str += ']';

    return str;
}

export class PrintLineGenerator {
    constructor(
        private position: Vector2,
        step: number = 16
    ) {
        this.n = 0;
        this.step = step;
    }

    private n: number;

    get it(): number {
        return this.n;
    }

    private readonly step: number;

    reset(): void {
        this.n = 0;
    }

    call(...args: string[]) {
        for (const arg of args) {
            love.graphics.print(
                arg,
                this.position.x,
                this.position.y + this.n * this.step
            );

            this.n++;
        }
    }
}

export function CreateClosureCallable<T extends ObjectCallable>(obj: T) {
    /** @noSelf **/
    return (...args: any[]) => {
        obj.call(...args);
    };
}

export function stepClosure<T>(callBackFunction: (i: number) => T): () => void {
    let i: number = 0;

    /** @noSelf **/
    return () => {
        i++;
        callBackFunction(i);
    };
}
