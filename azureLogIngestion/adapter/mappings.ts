import camelcase from "./utils/camelcase"
import mapper from "./utils/mapper"
import { v4 as uuidv4 } from "uuid"

const commonProps = {
    appId: "resourceGuid",
    applicationVersion: "appVersion",
    appName: "resourceId",
    cloudRoleInstance: "appRoleInstance",
    cloudRoleName: "appRoleName",
    customDimensions: "properties",
    customMeasurements: "measurements",
    duration: "durationMs",
    operationParentId: "parentId",
    time: "timestamp",
    TimeGenerated: "timestamp",
}

// https://docs.microsoft.com/en-us/azure/azure-monitor/app/apm-tables#apprequests
const appRequestMap = {
    ...commonProps,
    httpMethod: "http.method",
    httpPath: "http.path",
    resultCode: "http.statusCode",
    url: "http.url",
}

// https://docs.microsoft.com/en-us/azure/azure-monitor/app/apm-tables#appdependencies
const appDependencyMap = {
    ...commonProps,
    httpMethod: "http.method",
    httpPath: "http.path",
    url: "http.url",
}

const appEventMap = {
    ...commonProps,
}

const appExceptionMap = {
    ...commonProps,
    message: "error.message",
    outerMessage: "error.class",
}

const appAvailabilityResultMap = {
    ...commonProps,
}

const appPageViewMap = {
    ...commonProps,
}

const appBrowserTimingMap = {
    ...commonProps,
    totalDuration: "durationMs",
    totalDurationMs: "durationMs",
}

export const normalizeAppRequest = (data: Record<string, any>): Record<string, any> => {
    const request = mapper(camelcase(data), appRequestMap)
    delete request.IKey
    request.type = "AppRequest"
    return request
}

export const normalizeAppDependency = (data: Record<string, any>): Record<string, any> => {
    // This is going to be overwritten by mapper, so keep a copy if exists (app insights only)
    const { type } = data
    let dependency = mapper(camelcase(data), appDependencyMap)
    delete dependency.iKey
    if (type) {
        dependency.dependencyType = type
    }
    if (
        ["sql", "mariadb", "postgresql", "cosmos", "table", "storage"].indexOf(
            dependency.dependencyType.toLowerCase(),
        ) !== -1
    ) {
        if (dependency.name) {
            dependency.name = `Datastore/${dependency.name}`
        }
        dependency = mapper(dependency, { data: "db.statement", resultCode: "db.responseCode", target: "db.target" })
    }
    if (dependency.dependencyType.toLowerCase() === "http") {
        if (dependency.name) {
            dependency.name = `External/${dependency.name}`
        }
        dependency = mapper(dependency, { resultCode: "http.statusCode", target: "http.target" })
    }
    dependency.type = "AppDependency"
    return dependency
}

export const normalizeAppEvent = (data: Record<string, any>): Record<string, any> => {
    const event = mapper(camelcase(data), appEventMap)
    delete event.iKey
    event.type = "AppEvent"
    return event
}

export const normalizeAppPageView = (data: Record<string, any>): Record<string, any> => {
    const pageView = mapper(camelcase(data), appPageViewMap)
    delete pageView.iKey
    pageView.type = "AppPageView"
    return pageView
}

export const normalizeAppException = (data: Record<string, any>): Record<string, any> => {
    const exception = mapper(camelcase(data), appExceptionMap)
    delete exception.iKey
    exception.id = exception.id ? exception.id : uuidv4()
    exception.name = exception.assembly
    exception.error = true
    return exception
}

export const normalizeAppAvailabilityResult = (data: Record<string, any>): Record<string, any> => {
    const result = mapper(camelcase(data), appAvailabilityResultMap)
    delete result.iKey
    result.type = "AppAvailabilityResult"
    return result
}

export const normalizeAppBrowserTiming = (data: Record<string, any>): Record<string, any> => {
    const timing = mapper(camelcase(data), appBrowserTimingMap)
    delete timing.iKey
    timing.type = "AppBrowserTiming"
    return timing
}
