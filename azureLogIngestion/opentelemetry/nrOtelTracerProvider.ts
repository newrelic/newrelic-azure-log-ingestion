import { BasicTracerProvider } from "@opentelemetry/tracing"
import { Resource } from "@opentelemetry/resources"
import { TracerConfig } from "@opentelemetry/tracing/build/src/types"

export default class NrOtelTracerProvider extends BasicTracerProvider {
    constructor(config?: TracerConfig) {
        super(config)
    }
    updateResource(resource: Resource): void {
        this["_resource" as any] = resource
    }
}
