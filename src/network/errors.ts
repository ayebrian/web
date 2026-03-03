export class ApiError extends Error {
    constructor(
        public status: number,
        public body: unknown,
    ) {
        super(`API Error: ${status}`);
    }
}

export class UnauthorizedError extends Error {
    constructor() {
        super('Unauthorized');
    }
}

export class UnknownError extends Error {
    constructor(message: string) {
        super(message);
    }
}
