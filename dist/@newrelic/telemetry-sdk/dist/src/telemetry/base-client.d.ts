/// <reference types="node" />
import { OutgoingHttpHeaders, IncomingMessage } from "http"
import { Logger } from "../common"
export interface SendDataOptions {
    host: string
    port: number
    pathname: string
    headers?: OutgoingHttpHeaders
    query?:
        | string
        | null
        | {
              [key: string]: string | number
          }
}
/**
 * Client and data used to send data to SDK endpoints.
 * Aids in handling of send responses, primarily for retries and data splitting.
 * Allows the addition of any arbitrary metadata to help with further processing
 */
export interface RequestData<T> {
    /**
     * Client used to make the request.
     */
    client: BaseClient<T>
    /**
     * Original data (not serialized) sent in the request.
     */
    originalData: T
    /**
     * Allows any additional metadata to be added to aid in request processing.
     */
    [key: string]: any
}
export interface SendCallback<T> {
    (error: Error, response: IncomingMessage, body: string, requestData?: RequestData<T>): void
}
export declare class RequestResponseError extends Error {
    innerError: Error
    constructor(message: string, innerError?: Error)
}
export declare abstract class BaseClient<T> {
    private static packageVersion
    private product
    private productVersion
    private userAgentHeader
    logger: Logger
    constructor(logger?: Logger)
    abstract send(data: T, callback: SendCallback<T>): void
    addVersionInfo(product: string, productVersion: string): void
    protected getUserAgentHeaderValue(name: string, version: string): string
    static getPackageVersion(): string
    protected _sendData(
        sendOptions: SendDataOptions,
        payload: string,
        callback: (error: Error, response: IncomingMessage, body: string) => void,
    ): void
}
