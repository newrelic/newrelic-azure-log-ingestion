import { SummaryValue } from './summary';
import { AttributeMap } from '../attributeMap';
export declare enum MetricType {
    Summary = "summary",
    Gauge = "gauge",
    Count = "count"
}
export declare type MetricValue = number | SummaryValue;
export interface Metric {
    name: string;
    value: MetricValue;
    type?: MetricType;
    attributes?: AttributeMap;
    timestamp?: number;
    'interval.ms'?: number;
}
export declare abstract class MetricBase<ValueT extends MetricValue> implements Metric {
    name: string;
    value: ValueT;
    type: MetricType;
    attributes?: AttributeMap;
    timestamp?: number;
    'interval.ms'?: number;
    constructor(name: string, type: MetricType, value: ValueT, attributes?: AttributeMap, timestamp?: number, intervalMs?: number);
    abstract record(value: number): this;
}
