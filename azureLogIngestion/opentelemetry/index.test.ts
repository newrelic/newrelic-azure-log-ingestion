import OpenTelemetryAdapter from "./index"

import {
    appInsightsAppDependency,
    appInsightsAppEvent,
    appInsightsAppException,
    appInsightsAppRequest,
    arrayOfStrings,
} from "../adapter/testdata.test"
import { BatchSpanProcessor } from "@opentelemetry/tracing"

import { NRTracerProvider } from "./provider"

process.env["OTEL"] = "true"
process.env["otelJestTests"] = "true"

describe("OpenTelemetryAdapter", () => {
    it("instantiates with api key", () => {
        const adapter = new OpenTelemetryAdapter("mock-insert-key")

        expect(adapter).toBeInstanceOf(OpenTelemetryAdapter)

        expect(adapter.spanProcessor).toBeInstanceOf(BatchSpanProcessor)
        expect(adapter.traceProvider).toBeInstanceOf(NRTracerProvider)
        expect(adapter.currentBatch).toBeInstanceOf(Array)
        expect(adapter.getBatchSize()).toEqual(0)
    })

    it("processes app request and dependency as spans", () => {
        const adapter = new OpenTelemetryAdapter("mock-insert-key")

        const log = (...args) => null
        log.verbose = (...args) => null
        log.info = (...args) => null
        log.warn = (...args) => null
        log.error = (...args) => null

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

        expect(adapter.getBatchSize()).toEqual(0)
        expect(adapter.currentBatch).toMatchSnapshot()

        adapter.processMessages(appInsightsAppRequest, mockContext)
        expect(adapter.getBatchSize()).toEqual(1)
        expect(adapter.currentBatch).toMatchSnapshot()

        adapter.processMessages(appInsightsAppDependency, mockContext)
        expect(adapter.getBatchSize()).toEqual(2)
        expect(adapter.currentBatch).toMatchSnapshot()
    })

    it("processes app request and dependency when sent as array of strings", () => {
        const adapter = new OpenTelemetryAdapter("mock-insert-key")

        const log = (...args) => null
        log.verbose = (...args) => null
        log.info = (...args) => null
        log.warn = (...args) => null
        log.error = (...args) => null

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

        expect(adapter.getBatchSize()).toEqual(0)
        expect(adapter.currentBatch).toMatchSnapshot()

        adapter.processMessages(arrayOfStrings, mockContext)
        expect(adapter.getBatchSize()).toEqual(3)
        expect(adapter.currentBatch).toMatchSnapshot()

        adapter.processMessages(appInsightsAppDependency, mockContext)
        expect(adapter.getBatchSize()).toEqual(4)
        expect(adapter.currentBatch).toMatchSnapshot()
    })

    it("processes app event as span", () => {
        const adapter = new OpenTelemetryAdapter("mock-insert-key")

        const log = (...args) => null
        log.verbose = (...args) => null
        log.info = (...args) => null
        log.warn = (...args) => null
        log.error = (...args) => null

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

        expect(adapter.getBatchSize()).toEqual(0)
        expect(adapter.currentBatch).toMatchSnapshot()

        adapter.processMessages(appInsightsAppEvent, mockContext)

        expect(adapter.getBatchSize()).toEqual(1)
        expect(adapter.currentBatch).toMatchSnapshot()
    })

    it("processes app exception as span", () => {
        const adapter = new OpenTelemetryAdapter("mock-insert-key")

        const log = (...args) => null
        log.verbose = (...args) => null
        log.info = (...args) => null
        log.warn = (...args) => null
        log.error = (...args) => null

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
        expect(adapter.getBatchSize()).toEqual(0)
        expect(adapter.currentBatch).toMatchSnapshot()

        adapter.processMessages(appInsightsAppException, mockContext)

        expect(adapter.getBatchSize()).toEqual(1)
        expect(adapter.currentBatch).toMatchSnapshot()
    })
})
