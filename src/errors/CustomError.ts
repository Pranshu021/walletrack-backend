type criticalityType = "info" | "warning" | "medium" | "high" | "critical"

export class CustomError extends Error {
    statusCode: number;
    criticality: criticalityType

    constructor(message: string, statusCode: number, criticality: criticalityType) {
        super(message)

        Object.setPrototypeOf(this, new.target.prototype)
        this.message = message,
        this.statusCode = statusCode,
        this.criticality = criticality

        Error.captureStackTrace(this, this.constructor);
    }
}