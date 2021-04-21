import { Metric } from "./metric"
import { AttributeMap } from "../attributeMap"
interface CommonMetricData {
    attributes?: AttributeMap
    timestamp?: number
    "interval.ms"?: number
}
interface MetricBatchPayload {
    common?: CommonMetricData
    metrics: Metric[]
}
export declare const LIMIT = 2000
export declare class MetricBatch implements MetricBatchPayload {
    common?: CommonMetricData
    metrics: Metric[]
    constructor(attributes?: AttributeMap, timestamp?: number, interval?: number, metrics?: Metric[])
    getBatchSize(): number
    split(): MetricBatch[]
    private static createNew
    computeInterval(endTime: number): this
    addMetric(metric: Metric): MetricBatch
    protected getRandomInt(min: number, max: number): number
}
export {}
