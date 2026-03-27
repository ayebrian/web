export type NetworkError =
    | {type: 'unknown'; message: string}
    | {type: 'network'; message: string}
    | {type: 'unauthorized'; status: number}
    | {type: 'parse'; message: string};
