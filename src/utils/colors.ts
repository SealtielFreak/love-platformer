import { random } from 'love.math';
import RGB from '@/types/color';

export const randomColor: () => RGB = () => [
    random(255) / 255,
    random(255) / 255,
    random(255) / 255,
];

export function createColor(r: number, g: number, b: number): RGB {
    return [r / 255, g / 255, b / 255];
}
