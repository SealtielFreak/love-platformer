import { Vector2 } from "../collision"

export interface ObjectCallable {
    call(...args: any[]): void
}

export const diference = (a: number, b: number): number => Math.abs(b - a)

export function range(a: number, b?: number): number[] {
    if(typeof b == 'undefined') {
        [a, b] = [0, a]
    }

    let arr: number[] = []
    const length = diference(a, b)

    for(let i = 0; i < length; i++, a++) {
        arr[i] = a
    }

    return arr
}

export function printArray<T>(arr: T[]): string {
    let str = '['

    for(let i = 0; i < arr.length; i++) {
        str += `${i}`
        if(i < arr.length - 1) {
            str += ', '
        }
    }

    str += ']'

    return str
}

export class ClosurePrintLine {
    private _it: number
    private _step: number

    constructor(private _position: Vector2, step: number = 16, ) {
        this._it = 0
        this._step = step
    }

    get it(): number {
        return this._it
    }

    get step(): number {
        return this._step
    }

    reset(): void {
        this._it = 0
    }

    call(...args: string[]) {
        for(let arg of args) {
            love.graphics.print(arg, this._position.x, this._position.y + (this._it * this.step))
            this._it++
        }
    }
}

export function closureCallableGenerator<T extends ObjectCallable>(obj: T) {

    /** @noSelf **/
    return (...args: any[]) => {
        obj.call(...args)
    }
}

export function stepClosure(callbackfn: (i: number) => any): () => void {
    let i: number = 0

    /** @noSelf **/
    return () => {
        i++
        callbackfn(i)
    }
}