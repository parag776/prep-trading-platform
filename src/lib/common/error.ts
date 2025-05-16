export enum ErrorType{
    InsufficientLiquidityError,
    InsufficientMarginError,
}

export class AppError extends Error{
    status: number;
    type: ErrorType
    constructor(type: ErrorType, message: string, status: number){
        super(message);
        this.type = type;
        this.status = status;
    }
}