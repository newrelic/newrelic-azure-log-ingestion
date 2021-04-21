import { MetricBase } from './metric';
import { AttributeMap } from '../attributeMap';
export declare class GaugeMetric extends MetricBase<number> {
    constructor(name: string, value: number, attributes?: AttributeMap, timestamp?: number);
    record(value: number): this;
}
