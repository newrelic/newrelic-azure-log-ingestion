import { Resource } from "@opentelemetry/resources"
import { BasicTracerProvider } from "@opentelemetry/tracing"

export class NRTracerProvider extends BasicTracerProvider {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    resource: Resource

    updateResource(resource: Resource): void {
        this.resource = resource
    }
}
