import { MetricBase } from './metric';
import { AttributeMap } from '../attributeMap';
export declare class CountMetric extends MetricBase<number> {
    constructor(name: string, value?: number, attributes?: AttributeMap, timestamp?: number, intervalMs?: number);
    record(value?: number): this;
}
