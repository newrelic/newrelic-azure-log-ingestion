import { MetricBase } from './metric';
import { AttributeMap } from '../attributeMap';
export interface SummaryValue {
    count: number;
    sum: number;
    min: number;
    max: number;
}
export declare class SummaryMetric extends MetricBase<SummaryValue> {
    constructor(name: string, value?: SummaryValue, attributes?: AttributeMap, timestamp?: number, intervalMs?: number);
    record(value: number): this;
}
