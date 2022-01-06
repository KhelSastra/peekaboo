export type MultilingualString = {
    [key: string]: string,
    d: string
}

export interface Scene {
    mode: 'story' | 'find',
    bg: string,
    sprites: Sprite[],
    dialogues?: Dialogue[],
    rings?: Ring[]
}

export interface Script {
    gameover?: {
        heading: MultilingualString,
        text: MultilingualString
    },
    scenes: Scene[],
}

export interface Dialogue {
    speaker: string,
    text: MultilingualString
}

export interface Ring {
    center: Point,
    radius: number
}

export interface Point {
    x: number,
    y: number
}

export interface Sprite {
    name: string,
    position: Point
}