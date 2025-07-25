import { random } from 'love.math';

export const randomColor: () => [number, number, number] = () => [
    random(255) / 255,
    random(255) / 255,
    random(255) / 255,
];

export function createColor(
    r: number,
    g: number,
    b: number
): [number, number, number] {
    return [r / 255, g / 255, b / 255];
}
