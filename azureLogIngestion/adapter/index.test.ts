import { telemetry } from "@newrelic/telemetry-sdk"

import Adapter from "./index"
import { SpanProcessor } from "./processors"

describe("Adapter", () => {
    it("intantiates with api key", () => {
        const adapter = new Adapter("mock-insert-key")

        expect(adapter).toBeInstanceOf(Adapter)
        expect(adapter.spanProcessor).toBeInstanceOf(SpanProcessor)
        expect(adapter.spanProcessor.batch).toBeInstanceOf(telemetry.spans.SpanBatch)
        expect(adapter.spanProcessor.batch.getBatchSize()).toEqual(0)
        expect(adapter.spanProcessor.client).toBeInstanceOf(telemetry.spans.SpanClient)
    })
})
