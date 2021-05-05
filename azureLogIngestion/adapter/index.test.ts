import { telemetry } from "@newrelic/telemetry-sdk"

import Adapter from "./index"
import { SpanProcessor } from "./processors"

import { appInsightsAppDependency, appInsightsAppRequest } from "./testdata"
describe("Adapter", () => {
    it("instantiates with api key", () => {
        const adapter = new Adapter("mock-insert-key")

        expect(adapter).toBeInstanceOf(Adapter)
        expect(adapter.spanProcessor).toBeInstanceOf(SpanProcessor)
        expect(adapter.spanProcessor.batch).toBeInstanceOf(telemetry.spans.SpanBatch)
        expect(adapter.spanProcessor.batch.getBatchSize()).toEqual(0)
        expect(adapter.spanProcessor.client).toBeInstanceOf(telemetry.spans.SpanClient)
    })

    it("processes app request and dependency as spans", () => {
        const adapter = new Adapter("mock-insert-key")

        const log = (...args) => {
            console.log(...args)
        }
        log.verbose = (...args) => {
            console.debug(...args)
        }
        log.info = (...args) => {
            console.info(...args)
        }
        log.warn = (...args) => {
            console.warn(...args)
        }
        log.error = (...args) => {
            console.error(...args)
        }

        const mockContext = {
            bindings: {},
            bindingData: {},
            bindingDefinitions: [],
            done: () => null,
            executionContext: { invocationId: "foobar", functionName: "foobar", functionDirectory: "foobar" },
            invocationId: "foobar",
            log,
            traceContext: { attributes: {}, traceparent: "foobar", tracestate: "foobar" },
        }

        expect(adapter.spanProcessor.batch.getBatchSize()).toEqual(0)
        expect(adapter.spanProcessor.batch.spans).toMatchSnapshot()

        adapter.processMessages(appInsightsAppRequest, mockContext)
        expect(adapter.spanProcessor.batch.getBatchSize()).toEqual(1)
        expect(adapter.spanProcessor.batch.spans).toMatchSnapshot()

        adapter.processMessages(appInsightsAppDependency, mockContext)
        expect(adapter.spanProcessor.batch.getBatchSize()).toEqual(2)
        expect(adapter.spanProcessor.batch.spans).toMatchSnapshot()
    })
})
