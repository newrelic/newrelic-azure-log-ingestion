import { telemetry } from "@newrelic/telemetry-sdk"

import Adapter from "./index"
import { EventProcessor, SpanProcessor, LogProcessor } from "./processors"

import {
    appInsightsAppDependency,
    appInsightsAppEvent,
    appInsightsAppException,
    appInsightsAppRequest,
    appInsightsAppTraces,
    arrayOfStrings,
} from "./testdata.test"

describe("Adapter", () => {
    it("instantiates with api key", () => {
        const adapter = new Adapter("mock-insert-key")

        expect(adapter).toBeInstanceOf(Adapter)

        expect(adapter.eventProcessor).toBeInstanceOf(EventProcessor)
        expect(adapter.eventProcessor.batch).toBeInstanceOf(telemetry.events.EventBatch)
        expect(adapter.eventProcessor.batch.getBatchSize()).toEqual(0)
        expect(adapter.eventProcessor.client).toBeInstanceOf(telemetry.events.EventClient)

        expect(adapter.spanProcessor).toBeInstanceOf(SpanProcessor)
        expect(adapter.spanProcessor.batch).toBeInstanceOf(telemetry.spans.SpanBatch)
        expect(adapter.spanProcessor.batch.getBatchSize()).toEqual(0)
        expect(adapter.spanProcessor.client).toBeInstanceOf(telemetry.spans.SpanClient)
    })

    it("processes app request and dependency as spans", () => {
        const adapter = new Adapter("mock-insert-key")

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

        expect(adapter.spanProcessor.batch.getBatchSize()).toEqual(0)
        expect(adapter.spanProcessor.batch.spans).toMatchSnapshot()

        adapter.processMessages(appInsightsAppRequest, mockContext)
        expect(adapter.spanProcessor.batch.getBatchSize()).toEqual(2)
        expect(adapter.spanProcessor.batch.spans).toMatchSnapshot()

        adapter.processMessages(appInsightsAppDependency, mockContext)
        expect(adapter.spanProcessor.batch.getBatchSize()).toEqual(4)
        expect(adapter.spanProcessor.batch.spans).toMatchSnapshot()
    })

    it("processes app request as event", () => {
        const adapter = new Adapter("mock-insert-key")

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

        expect(adapter.eventProcessor.batch.getBatchSize()).toEqual(0)
        expect(adapter.eventProcessor.batch.events).toMatchSnapshot()

        adapter.processMessages(appInsightsAppRequest, mockContext)
        expect(adapter.eventProcessor.batch.getBatchSize()).toEqual(1)
        expect(adapter.eventProcessor.batch.events).toMatchSnapshot()
    })

    it("processes app request and dependency when sent as array of strings", () => {
        const adapter = new Adapter("mock-insert-key")

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

        expect(adapter.spanProcessor.batch.getBatchSize()).toEqual(0)
        expect(adapter.spanProcessor.batch.spans).toMatchSnapshot()

        adapter.processMessages(arrayOfStrings, mockContext)
        expect(adapter.spanProcessor.batch.getBatchSize()).toEqual(6)
        expect(adapter.spanProcessor.batch.spans).toMatchSnapshot()

        adapter.processMessages(appInsightsAppDependency, mockContext)
        expect(adapter.spanProcessor.batch.getBatchSize()).toEqual(8)
        expect(adapter.spanProcessor.batch.spans).toMatchSnapshot()
    })

    it("processes app event as event and span", () => {
        const adapter = new Adapter("mock-insert-key")

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

        expect(adapter.eventProcessor.batch.getBatchSize()).toEqual(0)
        expect(adapter.spanProcessor.batch.getBatchSize()).toEqual(0)
        expect(adapter.eventProcessor.batch.events).toMatchSnapshot()
        expect(adapter.spanProcessor.batch.spans).toMatchSnapshot()

        adapter.processMessages(appInsightsAppEvent, mockContext)

        expect(adapter.eventProcessor.batch.getBatchSize()).toEqual(1)
        expect(adapter.spanProcessor.batch.getBatchSize()).toEqual(2)
        expect(adapter.eventProcessor.batch.events).toMatchSnapshot()
        expect(adapter.spanProcessor.batch.spans).toMatchSnapshot()
    })

    it("processes app traces as logs", () => {
        const adapter = new Adapter("mock-insert-key")

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

        // TODO: add batch size check to logs in telemetry sdk (currently in PR)
        // expect(adapter.logProcessor.batch.getBatchSize()).toEqual(0)
        expect(adapter.logProcessor.batch.logs).toMatchSnapshot()

        adapter.processMessages(appInsightsAppTraces, mockContext)

        // expect(adapter.logProcessor.batch.getBatchSize()).toEqual(2)
        expect(adapter.logProcessor.batch.logs).toMatchSnapshot()
    })

    it("processes app exception as event and span", () => {
        const adapter = new Adapter("mock-insert-key")

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
        expect(adapter.spanProcessor.batch.getBatchSize()).toEqual(0)
        expect(adapter.spanProcessor.batch.spans).toMatchSnapshot()

        adapter.processMessages(appInsightsAppException, mockContext)

        expect(adapter.eventProcessor.batch.getBatchSize()).toEqual(1)
        expect(adapter.spanProcessor.batch.getBatchSize()).toEqual(2)
        expect(adapter.eventProcessor.batch.events).toMatchSnapshot()
        expect(adapter.spanProcessor.batch.spans).toMatchSnapshot()
    })
})
