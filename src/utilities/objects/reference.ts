export interface ReferenceObject<T> {
    assign(other: T): void

    equals(...others: T[]): boolean
}
