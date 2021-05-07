import camelcase from "./utils/camelcase"
import mapper from "./utils/mapper"

// https://docs.microsoft.com/en-us/azure/azure-monitor/app/apm-tables#apprequests
const appRequestMap = {
    appId: "resourceGuid",
    applicationVersion: "appVersion",
    appName: "resourceId",
    cloudRoleInstance: "appRoleInstance",
    cloudRoleName: "appRoleName",
    customDimensions: "properties",
    customMeasurements: "measurements",
    duration: "durationMs",
    httpMethod: "http.method",
    httpPath: "http.path",
    itemType: "type",
    operationParentId: "parentId",
    resultCode: "http.statusCode",
    time: "timestamp",
    timeGenerated: "timestamp",
    url: "http.url",
}

// https://docs.microsoft.com/en-us/azure/azure-monitor/app/apm-tables#appdependencies
const appDependencyMap = {
    appId: "resourceGuid",
    applicationVersion: "appVersion",
    appName: "resourceId",
    cloudRoleInstance: "appRoleInstance",
    cloudRoleName: "appRoleName",
    customDimensions: "properties",
    customMeasurements: "measurements",
    duration: "durationMs",
    httpMethod: "http.method",
    httpPath: "http.path",
    operationParentId: "parentId",
    resultCode: "http.statusCode",
    time: "timestamp",
    TimeGenerated: "timestamp",
    url: "http.url",
}

export const normalizeAppRequest = (data: Record<string, any>): Record<string, any> => {
    const normalizedRequest = mapper(camelcase(data), appRequestMap)
    normalizedRequest.type = "AppRequest"
    return normalizedRequest
}

export const normalizeAppDependency = (data: Record<string, any>): Record<string, any> => {
    // This is going to be overwrriten by mapper, so keep a copy
    const { type } = data
    const normalizedDependency = mapper(camelcase(data), appDependencyMap)
    if (type) {
        normalizedDependency.dependencyType = type
    }
    normalizedDependency.type = "AppDependency"
    return normalizedDependency
}
