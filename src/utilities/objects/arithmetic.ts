export interface ArithmeticObject {
    add(...others: ArithmeticObject[]): ArithmeticObject

    sub(...others: ArithmeticObject[]): ArithmeticObject

    mul(...others: ArithmeticObject[]): ArithmeticObject

    div(...others: ArithmeticObject[]): ArithmeticObject

    pow(...others: ArithmeticObject[]): ArithmeticObject
}

export const addObjects = <T extends ArithmeticObject>(...others: T[]): T => {
    return others[0].add(...others.splice(0, others.length)) as T
}

export const subObjects = <T extends ArithmeticObject>(...others: T[]): T => {
    return others[0].sub(...others.splice(0, others.length)) as T
}

export const mulObjects = <T extends ArithmeticObject>(...others: T[]): T => {
    return others[0].mul(...others.splice(0, others.length)) as T
}

export const divObjects = <T extends ArithmeticObject>(...others: T[]): T => {
    return others[0].div(...others.splice(0, others.length)) as T
}

export const powObjects = <T extends ArithmeticObject>(...others: T[]): T => {
    return others[0].pow(...others.splice(0, others.length)) as T
}