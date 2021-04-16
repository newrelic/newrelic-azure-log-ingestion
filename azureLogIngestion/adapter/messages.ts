export enum MessageType {
    Event,
    Log,
    Metric,
    Span,
}

export interface SpanMessage {
    Id: string
    ParentId: string
    OperationId: string
    time: number
    Name: string
    DurationMs: number
    OperationName: string
    Properties?: any
    IKey?: string
}

// Union type for message interfaces
export type Message = SpanMessage

export interface Records {
    records: Message[]
}
