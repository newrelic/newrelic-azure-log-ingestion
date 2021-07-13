import { Resource } from "@opentelemetry/resources"
import { BasicTracerProvider } from "@opentelemetry/tracing"

export class NRTracerProvider extends BasicTracerProvider {
    // @ts-ignore
    resource: Resource

    updateResource(resource: Resource): void {
        this.resource = resource
    }
}
