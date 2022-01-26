import { Vector2 } from "./collision"

export function moveController(dt: number = 1, speed: number = 1, dir: [number, number] = [1, 1]): Vector2 {
    let move = new Vector2()
    speed *= dt

    if(dir[0] != 0) {
        if(love.keyboard.isDown('left', 'a')) {
            move.x -= 1 * speed
        } else if(love.keyboard.isDown('right', 'd')) {
            move.x += 1 * speed
        }
    }

    if(dir[1] != 0) {
        if(love.keyboard.isDown('up', 'w')) {
            move.y -= 1 * speed
        } else if(love.keyboard.isDown('down', 's')) {
            move.y += 1 * speed
        }
    }

    return move
}

export function jumpController(dt: number = 1, speed: number = 1): Vector2 {
    let jump = new Vector2()

    if(love.keyboard.isDown('space', 'w')) {

    }

    return jump
}

export class PlayerControlls {
    private _move: Vector2

    constructor() {
        this._move = new Vector2()
    }

    get move(): Vector2 {
        return this._move
    }

    call() {
        
    }
}