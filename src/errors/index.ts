import { CustomError } from "./CustomError"

export class DatabaseError extends CustomError {
    constructor(message = "Database Error") {
        super(message, 500, "critical")
    }
}

export class InternalServerError extends CustomError {
    constructor(message = "Internal Server Error") {
        super(message, 500, "critical")
    }
}

export class NotFoundError extends CustomError {
    constructor(message = "Resource Not Found Error") {
        super(message, 404, "critical")
    }
}

export class ValidationError extends CustomError {
    constructor(message = "Validation Error") {
        super(message, 401, "critical")
    }
}

export class AuthenticationError extends CustomError {
    constructor(message = "Authentication Error") {
        super(message, 401, "critical")
    }
}