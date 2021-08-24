jest.useFakeTimers()

import OpenTelemetryAdapter from "./index"

import {
    appInsightsAppDependency,
    appInsightsAppEvent,
    appInsightsAppException,
    appInsightsAppRequest,
    arrayOfStrings,
} from "../adapter/testdata.test"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base"

import { NRTracerProvider } from "./provider"

process.env["OTEL"] = "true"
process.env["otelJestTests"] = "true"

describe("OpenTelemetryAdapter", () => {
    let log
    let mockContext
    beforeAll(() => {
        log = (...args) => null
        log.verbose = (...args) => null
        log.info = (...args) => null
        log.warn = (...args) => null
        log.error = (...args) => null

        mockContext = {
            bindings: {},
            bindingData: {},
            bindingDefinitions: [],
            done: () => null,
            executionContext: { invocationId: "foobar", functionName: "foobar", functionDirectory: "foobar" },
            invocationId: "foobar",
            log,
            traceContext: { attributes: {}, traceparent: "foobar", tracestate: "foobar" },
        }
    })

    it("instantiates with api key", () => {
        const adapter = new OpenTelemetryAdapter("mock-insert-key", mockContext)

        expect(adapter).toBeInstanceOf(OpenTelemetryAdapter)

        expect(adapter.spanProcessor.spanProcessor).toBeInstanceOf(BatchSpanProcessor)
        expect(adapter.spanProcessor.batch).toBeInstanceOf(Array)
        expect(adapter.spanProcessor.batch.length).toEqual(0)
    })

    it("processes app request and dependency as spans", () => {
        const adapter = new OpenTelemetryAdapter("mock-insert-key", mockContext)

        expect(adapter.spanProcessor.batch.length).toEqual(0)
        expect(adapter.spanProcessor.batch).toMatchSnapshot()

        adapter.processMessages(appInsightsAppRequest, mockContext)
        expect(adapter.spanProcessor.batch.length).toEqual(2)
        expect(adapter.spanProcessor.batch).toMatchSnapshot()

        adapter.processMessages(appInsightsAppDependency, mockContext)
        expect(adapter.spanProcessor.batch.length).toEqual(4)
        expect(adapter.spanProcessor.batch).toMatchSnapshot()
    })

    it("processes app request and dependency when sent as array of strings", () => {
        const adapter = new OpenTelemetryAdapter("mock-insert-key", mockContext)

        expect(adapter.spanProcessor.batch.length).toEqual(0)
        expect(adapter.spanProcessor.batch).toMatchSnapshot()

        adapter.processMessages(arrayOfStrings, mockContext)
        expect(adapter.spanProcessor.batch.length).toEqual(6)
        expect(adapter.spanProcessor.batch).toMatchSnapshot()

        adapter.processMessages(appInsightsAppDependency, mockContext)
        expect(adapter.spanProcessor.batch.length).toEqual(8)
        expect(adapter.spanProcessor.batch).toMatchSnapshot()
    })

    it("processes app event as span", () => {
        const adapter = new OpenTelemetryAdapter("mock-insert-key", mockContext)

        expect(adapter.spanProcessor.batch.length).toEqual(0)
        expect(adapter.spanProcessor.batch).toMatchSnapshot()

        adapter.processMessages(appInsightsAppEvent, mockContext)

        expect(adapter.spanProcessor.batch.length).toEqual(2)
        expect(adapter.spanProcessor.batch).toMatchSnapshot()
    })

    it("processes app exception as span", () => {
        const adapter = new OpenTelemetryAdapter("mock-insert-key", mockContext)

        expect(adapter.spanProcessor.batch.length).toEqual(0)
        expect(adapter.spanProcessor.batch).toMatchSnapshot()

        adapter.processMessages(appInsightsAppException, mockContext)

        expect(adapter.spanProcessor.batch.length).toEqual(2)
        expect(adapter.spanProcessor.batch).toMatchSnapshot()
    })
})
