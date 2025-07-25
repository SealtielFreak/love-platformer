import { Canvas } from 'love.graphics';

export const generateCanvas = (inner: () => void) => {
    const canvas: Canvas = love.graphics.newCanvas();

    love.graphics.setCanvas(canvas);
    inner();
    love.graphics.setCanvas();

    return canvas;
};
