import { AttributeMap } from '../attributeMap';
export interface EventData {
    eventType: string;
    attributes?: AttributeMap;
    timestamp?: number;
}
export declare class Event implements EventData {
    eventType: string;
    attributes?: AttributeMap;
    timestamp?: number;
    constructor(eventType: string, attributes?: AttributeMap, timestamp?: number);
}
