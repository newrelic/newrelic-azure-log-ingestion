export const appInsightsAppRequest = `{
  "records": [
    {
      "time": "2021-04-29T22:41:14.1238381Z",
      "resourceId": "/SUBSCRIPTIONS/subscriptionID goes here/RESOURCEGROUPS/resource group goes here/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/{function app name}",
      "ResourceGUID": "resourceGuid",
      "Type": "AppRequests",
      "AppRoleInstance": "very long id string",
      "AppRoleName": "functionAppName goes here",
      "ClientCity": "Portland",
      "ClientCountryOrRegion": "United States",
      "ClientIP": "0.0.0.0",
      "ClientStateOrProvince": "Oregon",
      "ClientType": "PC",
      "IKey": "iKeyValue",
      "_BilledSize": 1082,
      "OperationName": "{function name}",
      "OperationId": "12345",
      "ParentId": "12345",
      "SDKVersion": "azurefunctions: 3.0.15571.0",
      "Properties": {
        "LogLevel": "Information",
        "HttpPath": "/api/{function name goes here}",
        "FunctionExecutionTimeMs": "4.7239",
        "TriggerReason": "This function was programmatically called via the host APIs.",
        "InvocationId": "invocationIdValue",
        "ProcessId": "8912",
        "Category": "Host.Results",
        "HttpMethod": "GET",
        "FullName": "Functions.{function name}",
        "HostInstanceId": "hostInstanceIdValue"
      },
      "Id": "09d760d34d75e847",
      "Name": "{function name}",
      "Url": "https://{function app name}.azurewebsites.net/api/{function name}",
      "Success": true,
      "ResultCode": "200",
      "DurationMs": 9.1593,
      "PerformanceBucket": "<250ms",
      "ItemCount": 1
    }
  ]
}`

export const appInsightsAppDependency = `{
  "records": [
    {
      "time": "2021-05-04T22:01:10.9400000Z",
      "resourceId": "/SUBSCRIPTIONS/{subscription id}/RESOURCEGROUPS/{resource group in all caps}/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/{function app name in all caps}",
      "ResourceGUID": "{resource uuid4}",
      "Type": "AppDependencies",
      "AppRoleInstance": "{role instance id}",
      "AppRoleName": "Web",
      "ClientCity": "San Jose",
      "ClientCountryOrRegion": "United States",
      "ClientIP": "0.0.0.0",
      "ClientOS": "Windows_NT 10.0.14393",
      "ClientStateOrProvince": "California",
      "ClientType": "PC",
      "IKey": "{iKey value}",
      "_BilledSize": 786,
      "OperationId": "67890",
      "ParentId": "12345",
      "SDKVersion": "node:1.8.10",
      "Id": "{id value}",
      "Target": "{target property of client.trackDependency}",
      "DependencyType": "{dependencyTypeName property of client.trackDependency}",
      "Name": "{name property of client.trackDependency}",
      "Success": true,
      "DurationMs": 231,
      "PerformanceBucket": "<250ms",
      "ItemCount": 1
    }
  ]
}`

test("shut jest up", () => Promise.resolve(null))
