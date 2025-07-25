export function rangeAxis2D(x: number, y: number): number[][] {
    const arr = [];

    for (let i = 0; i < y; i++) {
        for (let j = 0; j < x; j++) {
            arr.push([j, i]);
        }
    }

    return arr;
}

export function* generatorAxis2D(x: number, y: number) {
    for (let i = 0; i < y; i++) {
        for (let j = 0; j < x; j++) {
            yield [j, i];
        }
    }
}
