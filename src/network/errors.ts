export type NetworkError =
    | {type: 'unknown'; message: string}
    | {type: 'status'; status: number}
    | {type: 'network'; message: string}
    | {type: 'unauthorized'; status: number}
    | {type: 'parse'; message: string};
