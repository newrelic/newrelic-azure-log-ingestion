import { Resource } from "@opentelemetry/resources"
import { BasicTracerProvider } from "@opentelemetry/tracing"

export class NRTracerProvider extends BasicTracerProvider {
    azureResource: Resource

    public get resource(): Resource {
        return this.azureResource
    }
    public set resource(resource: Resource) {
        this.azureResource = resource
    }
}
