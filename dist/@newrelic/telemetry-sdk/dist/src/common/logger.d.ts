export interface LoggerFunction {
    (message: string, ...args: any[]): void
}
export interface Logger {
    error: LoggerFunction
    info: LoggerFunction
    debug: LoggerFunction
}
export declare class NoOpLogger implements Logger {
    error: () => void
    info: () => void
    debug: () => void
}
