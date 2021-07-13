import { Resource } from "@opentelemetry/resources"
import { BasicTracerProvider } from "@opentelemetry/tracing"

export class NRTracerProvider extends BasicTracerProvider {
    constructor(props) {
        super(props)
        this["resource"] = this.resource
    }

    private _azureResource: Resource

    public get resource(): Resource {
        return this._azureResource
    }
    public set resource(resource: Resource) {
        this._azureResource = resource
    }
}

class NRTracerProviderImpl extends NRTracerProvider {}
