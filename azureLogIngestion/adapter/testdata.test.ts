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
      "DependencyType": "http",
      "Name": "{name property of client.trackDependency}",
      "Success": true,
      "DurationMs": 231,
      "PerformanceBucket": "<250ms",
      "ItemCount": 1
    }
  ]
}`

export const appInsightsAppEvent = `{
  "records": [
    {
      "time": "2021-05-04T19:12:36.1850000Z",
      "resourceId": "/SUBSCRIPTIONS/{subscription Id}/RESOURCEGROUPS/{resource group in all caps}/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/{function app name in all caps}",
      "ResourceGUID": "{guid of resource}",
      "Type": "AppEvents",
      "AppRoleInstance": "{role instance value}",
      "AppRoleName": "Web",
      "ClientCity": "San Jose",
      "ClientCountryOrRegion": "United States",
      "ClientIP": "0.0.0.0",
      "ClientOS": "Windows_NT 10.0.14393",
      "ClientStateOrProvince": "California",
      "ClientType": "PC",
      "IKey": "{iKey}",
      "_BilledSize": 742,
      "OperationId": "98765",
      "ParentId": "12345",
      "SDKVersion": "node:1.8.10",
      "Properties": {
        "myCustomProperty1": "This is my custom property",
        "myCustomProperty2": "And here is another.",
        "now": "2021-05-04T19:12:36.185Z"
      },
      "Name": "my custom event",
      "ItemCount": 1
    }
  ]
}`

export const appInsightsAppException = `{
  "records": [
    {
      "id": "uuidWillBeGeneratedForErrorSpans",
      "time": "2021-05-05T16:44:56.8020000Z",
      "resourceId": "/SUBSCRIPTIONS/{subscription ID}/RESOURCEGROUPS/{resource group name}/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/{function app name}",
      "ResourceGUID": "{resource GUID}",
      "Type": "AppExceptions",
      "AppRoleInstance": "{role instance ID}",
      "AppRoleName": "Web",
      "ClientCity": "San Jose",
      "ClientCountryOrRegion": "United States",
      "ClientIP": "0.0.0.0",
      "ClientOS": "Windows_NT 10.0.14393",
      "ClientStateOrProvince": "California",
      "ClientType": "PC",
      "IKey": "{iKey}",
      "_BilledSize": 3379,
      "OperationId": "{long operation id}",
      "ParentId": "{long operation id}",
      "SDKVersion": "node:1.8.10",
      "Details": [
        {
          "severityLevel": "Error",
          "outerId": "0",
          "message": "Error: Throwing an uncaught error on purpose.",
          "type": "Error",
          "id": "0",
          "parsedStack": [{
              "assembly": "at module.exports (path/to/file:lineNumber:charPos)",
              "method": "module.exports",
              "level": 0,
              "line": 266,
              "fileName": "path/to/file.js"
            },
            {
              "assembly": "at WorkerChannel.invocationRequest (path/to/file:lineNumber:charPos)",
              "method": "WorkerChannel.invocationRequest (path/to/file:lineNumber:charPos)",
              "level": 1,
              "line": 18579,
              "fileName": "path/to/file.js"
            },
            {
              "assembly": "at ClientDuplexStream.methodName (path/to/file:lineNumber:charPos)",
              "method": "ClientDuplexStream.methodName (Drive:/Directory",
              "level": 2,
              "line": 18359,
              "fileName": "path/to/file:lineNumber:charPos"
            },
            {
              "assembly": "at ClientDuplexStream.emit (path/to/file:lineNumber:charPos)",
              "method": "ClientDuplexStream.emit",
              "level": 3,
              "line": 314,
              "fileName": "file.js"
            }
          ]
        }
      ],
      "ProblemId": "Error at module.exports",
      "ExceptionType": "Error",
      "Assembly": "at module.exports (C:/home/site/wwwroot/functionName/index.js:266:43)",
      "Method": "module.exports",
      "OuterType": "Error",
      "OuterMessage": "Error: Throwing an uncaught error on purpose.",
      "OuterAssembly": "at module.exports (C:/home/site/wwwroot/functionName/index.js:266:43)",
      "OuterMethod": "module.exports",
      "InnermostType": "Error",
      "InnermostMessage": "Error: Throwing an uncaught error on purpose.",
      "InnermostAssembly": "at module.exports (C:/home/site/wwwroot/functionName/index.js:266:43)",
      "InnermostMethod": "module.exports",
      "SeverityLevel": 3,
      "ItemCount": 1
    }
  ]
}`

export const arrayOfStrings = [
    '{"records": [{ "time": "2021-05-10T18:10:20.4630000Z", "resourceId": "/SUBSCRIPTIONS/subscriptionId/RESOURCEGROUPS/resourceGroupName/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/functionAppName", "ResourceGUID": "resourceGuid", "Type": "AppPerformanceCounters", "AppRoleInstance": "roleInstance", "AppRoleName": "Web", "ClientCity": "San Jose", "ClientCountryOrRegion": "United States", "ClientIP": "0.0.0.0", "ClientOS": "Windows_NT 10.0.14393", "ClientStateOrProvince": "California", "ClientType": "PC", "IKey": "iKeyUuid", "_BilledSize": 688, "SDKVersion": "node:1.8.10", "Name": "% Processor Time", "Category": "Processor", "Counter": "% Processor Time", "Value": 0.768134898484558},{ "time": "2021-05-10T18:10:20.4630000Z", "resourceId": "/SUBSCRIPTIONS/subscriptionId/RESOURCEGROUPS/resourceGroupName/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/functionAppName", "ResourceGUID": "resourceGuid", "Type": "AppPerformanceCounters", "AppRoleInstance": "roleInstance", "AppRoleName": "Web", "ClientCity": "San Jose", "ClientCountryOrRegion": "United States", "ClientIP": "0.0.0.0", "ClientOS": "Windows_NT 10.0.14393", "ClientStateOrProvince": "California", "ClientType": "PC", "IKey": "iKeyUuid", "_BilledSize": 701, "SDKVersion": "node:1.8.10", "Name": "% Processor Time", "Category": "Process", "Counter": "% Processor Time", "Value": 0.013332147794311},{ "time": "2021-05-10T18:10:20.4630000Z", "resourceId": "/SUBSCRIPTIONS/subscriptionId/RESOURCEGROUPS/resourceGroupName/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/functionAppName", "ResourceGUID": "resourceGuid", "Type": "AppPerformanceCounters", "AppRoleInstance": "roleInstance", "AppRoleName": "Web", "ClientCity": "San Jose", "ClientCountryOrRegion": "United States", "ClientIP": "0.0.0.0", "ClientOS": "Windows_NT 10.0.14393", "ClientStateOrProvince": "California", "ClientType": "PC", "IKey": "iKeyUuid", "_BilledSize": 662, "SDKVersion": "node:1.8.10", "Name": "Private Bytes", "Category": "Process", "Counter": "Private Bytes", "Value": 3739648},{ "time": "2021-05-10T18:10:20.4630000Z", "resourceId": "/SUBSCRIPTIONS/subscriptionId/RESOURCEGROUPS/resourceGroupName/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/functionAppName", "ResourceGUID": "resourceGuid", "Type": "AppPerformanceCounters", "AppRoleInstance": "roleInstance", "AppRoleName": "Web", "ClientCity": "San Jose", "ClientCountryOrRegion": "United States", "ClientIP": "0.0.0.0", "ClientOS": "Windows_NT 10.0.14393", "ClientStateOrProvince": "California", "ClientType": "PC", "IKey": "iKeyUuid", "_BilledSize": 652, "SDKVersion": "node:1.8.10", "Name": "Available Bytes", "Category": "Memory", "Counter": "Available Bytes", "Value": 1997389824},{ "time": "2021-05-10T18:10:20.4630000Z", "resourceId": "/SUBSCRIPTIONS/subscriptionId/RESOURCEGROUPS/resourceGroupName/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/functionAppName", "ResourceGUID": "resourceGuid", "Type": "AppPerformanceCounters", "AppRoleInstance": "roleInstance", "AppRoleName": "Web", "ClientCity": "San Jose", "ClientCountryOrRegion": "United States", "ClientIP": "0.0.0.0", "ClientOS": "Windows_NT 10.0.14393", "ClientStateOrProvince": "California", "ClientType": "PC", "IKey": "iKeyUuid", "_BilledSize": 656, "SDKVersion": "node:1.8.10", "Name": "Requests/Sec", "Category": "ASP.NET Applications", "Counter": "Requests/Sec", "Value": 0},{ "time": "2021-05-10T18:10:20.4630000Z", "resourceId": "/SUBSCRIPTIONS/subscriptionId/RESOURCEGROUPS/resourceGroupName/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/functionAppName", "ResourceGUID": "resourceGuid", "Type": "AppPerformanceCounters", "AppRoleInstance": "roleInstance", "AppRoleName": "Web", "ClientCity": "San Jose", "ClientCountryOrRegion": "United States", "ClientIP": "0.0.0.0", "ClientOS": "Windows_NT 10.0.14393", "ClientStateOrProvince": "California", "ClientType": "PC", "IKey": "iKeyUuid", "_BilledSize": 666, "SDKVersion": "node:1.8.10", "Name": "Request Execution Time", "Category": "ASP.NET Applications", "Counter": "Request Execution Time", "Value": 0}]}',
    '{"records": [{ "time": "2021-05-10T18:14:48.8485302Z", "resourceId": "/SUBSCRIPTIONS/subscriptionId/RESOURCEGROUPS/resourceGroupName/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/functionAppName", "ResourceGUID": "resourceGuid", "Type": "AppMetrics", "AppRoleInstance": "roleInstanceId", "AppRoleName": "functionAppName", "ClientIP": "0.0.0.0", "ClientType": "PC", "IKey": "iKeyUuid", "_BilledSize": 1030, "SDKVersion": "hbnetc:2.16.0-18277", "SyntheticSource": "HeartbeatState", "Properties": {"appSrv_wsOwner":"subscriptionId+resourceGroupName-WestUSwebspace","appSrv_ResourceGroup":"resourceGroupName","appSrv_wsHost":"functionAppName.azurewebsites.net","runtimeFramework":".NET Core 3.1.13","osType":"WINDOWS","processSessionId":"8983b6b6-3eee-47e4-a538-f41abd6c756d","appSrv_SiteName":"functionAppName","appSrv_wsStamp":"waws-prod-bay-153","baseSdkTargetFramework":"netstandard2.0","ProcessId":"7588","appSrv_SlotName":"Production"}, "Name": "HeartbeatState", "Sum": 0, "Min": 0, "Max": 0, "ItemCount": 1}]}',
    '{"records": [{ "time": "2021-05-10T18:15:20.5160000Z", "resourceId": "/SUBSCRIPTIONS/subscriptionId/RESOURCEGROUPS/resourceGroupName/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/functionAppName", "ResourceGUID": "resourceGuid", "Type": "AppPerformanceCounters", "AppRoleInstance": "roleInstance", "AppRoleName": "Web", "ClientCity": "San Jose", "ClientCountryOrRegion": "United States", "ClientIP": "0.0.0.0", "ClientOS": "Windows_NT 10.0.14393", "ClientStateOrProvince": "California", "ClientType": "PC", "IKey": "iKeyUuid", "_BilledSize": 688, "SDKVersion": "node:1.8.10", "Name": "% Processor Time", "Category": "Processor", "Counter": "% Processor Time", "Value": 0.833944281524927},{ "time": "2021-05-10T18:15:20.5160000Z", "resourceId": "/SUBSCRIPTIONS/subscriptionId/RESOURCEGROUPS/resourceGroupName/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/functionAppName", "ResourceGUID": "resourceGuid", "Type": "AppPerformanceCounters", "AppRoleInstance": "roleInstance", "AppRoleName": "Web", "ClientCity": "San Jose", "ClientCountryOrRegion": "United States", "ClientIP": "0.0.0.0", "ClientOS": "Windows_NT 10.0.14393", "ClientStateOrProvince": "California", "ClientType": "PC", "IKey": "iKeyUuid", "_BilledSize": 704, "SDKVersion": "node:1.8.10", "Name": "% Processor Time", "Category": "Process", "Counter": "% Processor Time", "Value": 0.0133328639054167},{ "time": "2021-05-10T18:15:20.5160000Z", "resourceId": "/SUBSCRIPTIONS/subscriptionId/RESOURCEGROUPS/resourceGroupName/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/functionAppName", "ResourceGUID": "resourceGuid", "Type": "AppPerformanceCounters", "AppRoleInstance": "roleInstance", "AppRoleName": "Web", "ClientCity": "San Jose", "ClientCountryOrRegion": "United States", "ClientIP": "0.0.0.0", "ClientOS": "Windows_NT 10.0.14393", "ClientStateOrProvince": "California", "ClientType": "PC", "IKey": "iKeyUuid", "_BilledSize": 665, "SDKVersion": "node:1.8.10", "Name": "Private Bytes", "Category": "Process", "Counter": "Private Bytes", "Value": 10559488},{ "time": "2021-05-10T18:15:20.5160000Z", "resourceId": "/SUBSCRIPTIONS/subscriptionId/RESOURCEGROUPS/resourceGroupName/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/functionAppName", "ResourceGUID": "resourceGuid", "Type": "AppPerformanceCounters", "AppRoleInstance": "roleInstance", "AppRoleName": "Web", "ClientCity": "San Jose", "ClientCountryOrRegion": "United States", "ClientIP": "0.0.0.0", "ClientOS": "Windows_NT 10.0.14393", "ClientStateOrProvince": "California", "ClientType": "PC", "IKey": "iKeyUuid", "_BilledSize": 652, "SDKVersion": "node:1.8.10", "Name": "Available Bytes", "Category": "Memory", "Counter": "Available Bytes", "Value": 1961107456},{ "time": "2021-05-10T18:15:20.5160000Z", "resourceId": "/SUBSCRIPTIONS/subscriptionId/RESOURCEGROUPS/resourceGroupName/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/functionAppName", "ResourceGUID": "resourceGuid", "Type": "AppPerformanceCounters", "AppRoleInstance": "roleInstance", "AppRoleName": "Web", "ClientCity": "San Jose", "ClientCountryOrRegion": "United States", "ClientIP": "0.0.0.0", "ClientOS": "Windows_NT 10.0.14393", "ClientStateOrProvince": "California", "ClientType": "PC", "IKey": "iKeyUuid", "_BilledSize": 656, "SDKVersion": "node:1.8.10", "Name": "Requests/Sec", "Category": "ASP.NET Applications", "Counter": "Requests/Sec", "Value": 0},{ "time": "2021-05-10T18:15:20.5160000Z", "resourceId": "/SUBSCRIPTIONS/subscriptionId/RESOURCEGROUPS/resourceGroupName/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/functionAppName", "ResourceGUID": "resourceGuid", "Type": "AppPerformanceCounters", "AppRoleInstance": "roleInstance", "AppRoleName": "Web", "ClientCity": "San Jose", "ClientCountryOrRegion": "United States", "ClientIP": "0.0.0.0", "ClientOS": "Windows_NT 10.0.14393", "ClientStateOrProvince": "California", "ClientType": "PC", "IKey": "iKeyUuid", "_BilledSize": 666, "SDKVersion": "node:1.8.10", "Name": "Request Execution Time", "Category": "ASP.NET Applications", "Counter": "Request Execution Time", "Value": 0}]}',
    '{"records": [{ "time": "2021-05-10T18:18:24.3398647Z", "resourceId": "/SUBSCRIPTIONS/subscriptionId/RESOURCEGROUPS/resourceGroupName/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/functionAppName", "ResourceGUID": "resourceGuid", "Type": "AppPerformanceCounters", "AppRoleInstance": "roleInstanceId", "AppRoleName": "functionAppName", "ClientIP": "0.0.0.0", "ClientType": "PC", "IKey": "iKeyUuid", "_BilledSize": 722, "SDKVersion": "af_azwapccore:2.16.0-18277", "Properties": {"HostInstanceId":"bab0a416-cc64-4c8c-9b57-e8cd528918fb","ProcessId":"7588"}, "Name": "% Processor Time", "Category": "Process", "Counter": "% Processor Time", "Instance": "??APP_WIN32_PROC??", "Value": 0},{ "time": "2021-05-10T18:18:24.3400136Z", "resourceId": "/SUBSCRIPTIONS/subscriptionId/RESOURCEGROUPS/resourceGroupName/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/functionAppName", "ResourceGUID": "resourceGuid", "Type": "AppPerformanceCounters", "AppRoleInstance": "roleInstanceId", "AppRoleName": "functionAppName", "ClientIP": "0.0.0.0", "ClientType": "PC", "IKey": "iKeyUuid", "_BilledSize": 733, "SDKVersion": "af_azwapccore:2.16.0-18277", "Properties": {"HostInstanceId":"bab0a416-cc64-4c8c-9b57-e8cd528918fb","ProcessId":"7588"}, "Name": "% Processor Time Normalized", "Category": "Process", "Counter": "% Processor Time Normalized", "Instance": "??APP_WIN32_PROC??", "Value": 0},{ "time": "2021-05-10T18:18:24.3400300Z", "resourceId": "/SUBSCRIPTIONS/subscriptionId/RESOURCEGROUPS/resourceGroupName/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/functionAppName", "ResourceGUID": "resourceGuid", "Type": "AppPerformanceCounters", "AppRoleInstance": "roleInstanceId", "AppRoleName": "functionAppName", "ClientIP": "0.0.0.0", "ClientType": "PC", "IKey": "iKeyUuid", "_BilledSize": 743, "SDKVersion": "af_azwapccore:2.16.0-18277", "Properties": {"HostInstanceId":"hostUuid","ProcessId":"7588"}, "Name": "Private Bytes", "Category": "Process", "Counter": "Private Bytes", "Instance": "??APP_WIN32_PROC??", "Value": 233570304},{ "time": "2021-05-10T18:18:24.3400555Z", "resourceId": "/SUBSCRIPTIONS/subscriptionId/RESOURCEGROUPS/resourceGroupName/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/functionAppName", "ResourceGUID": "resourceGuid", "Type": "AppPerformanceCounters", "AppRoleInstance": "roleInstanceId", "AppRoleName": "functionAppName", "ClientIP": "0.0.0.0", "ClientType": "PC", "IKey": "iKeyUuid", "_BilledSize": 684, "SDKVersion": "af_azwapccore:2.16.0-18277", "Properties": {"HostInstanceId":"hostUuid","ProcessId":"7588"}, "Name": "Available Bytes", "Category": "Memory", "Counter": "Available Bytes", "Value": 1830309888},{ "time": "2021-05-10T18:18:24.3400693Z", "resourceId": "/SUBSCRIPTIONS/subscriptionId/RESOURCEGROUPS/resourceGroupName/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/functionAppName", "ResourceGUID": "resourceGuid", "Type": "AppPerformanceCounters", "AppRoleInstance": "roleInstanceId", "AppRoleName": "functionAppName", "ClientIP": "0.0.0.0", "ClientType": "PC", "IKey": "iKeyUuid", "_BilledSize": 723, "SDKVersion": "af_azwapccore:2.16.0-18277", "Properties": {"HostInstanceId":"hostUuid","ProcessId":"7588"}, "Name": "IO Data Bytes/sec", "Category": "Process", "Counter": "IO Data Bytes/sec", "Instance": "??APP_WIN32_PROC??", "Value": 0}]}',
    '{"records": [{ "time": "2021-05-10T19:19:31.9080000Z", "resourceId": "/SUBSCRIPTIONS/subscriptionId/RESOURCEGROUPS/resourceGroupName/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/functionAppName", "ResourceGUID": "resourceGuid", "Type": "AppDependencies", "AppRoleInstance": "roleInstanceId", "AppRoleName": "Web", "ClientCity": "San Jose", "ClientCountryOrRegion": "United States", "ClientIP": "0.0.0.0", "ClientOS": "Windows_NT 10.0.14393", "ClientStateOrProvince": "California", "ClientType": "PC", "IKey": "iKeyUuid", "_BilledSize": 786, "OperationId": "parentId", "ParentId": "parentId", "SDKVersion": "node:1.8.10", "Id": "recordId", "Target": "Buffer", "DependencyType": "Buffer", "Name": "node buffer", "Success": true, "DurationMs": 231, "PerformanceBucket": "<250ms", "ItemCount": 1},{ "time": "2021-05-10T19:19:32.0490000Z", "resourceId": "/SUBSCRIPTIONS/subscriptionId/RESOURCEGROUPS/resourceGroupName/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/functionAppName", "ResourceGUID": "resourceGuid", "Type": "AppDependencies", "AppRoleInstance": "dw0-hr0-1068-25", "AppRoleName": "Web", "ClientCity": "San Jose", "ClientCountryOrRegion": "United States", "ClientIP": "0.0.0.0", "ClientOS": "Windows_NT 10.0.14393", "ClientStateOrProvince": "California", "ClientType": "PC", "IKey": "iKeyUuid", "_BilledSize": 834, "OperationId": "opId", "ParentId": "parentId", "SDKVersion": "node:1.8.10", "Id": "id", "Target": "http://dbname", "DependencyType": "ZSQL", "Name": "select customers proc", "Data": "SELECT * FROM Customers", "Success": true, "DurationMs": 231, "PerformanceBucket": "<250ms", "ItemCount": 1}]}',
    '{"records": [{ "time": "2021-05-10T19:19:21.0600528Z", "resourceId": "/SUBSCRIPTIONS/subscriptionId/RESOURCEGROUPS/resourceGroupName/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/functionAppName", "ResourceGUID": "resourceGuid", "Type": "AppRequests", "AppRoleInstance": "roleInstanceId", "AppRoleName": "functionAppName", "ClientCity": "Pittsburgh", "ClientCountryOrRegion": "United States", "ClientIP": "0.0.0.0", "ClientStateOrProvince": "Pennsylvania", "ClientType": "PC", "IKey": "iKeyUuid", "_BilledSize": 1087, "OperationName": "functionName", "OperationId": "operationId", "ParentId": "parentId", "SDKVersion": "azurefunctions: 3.0.15584.0", "Properties": {"LogLevel":"Information","TriggerReason":"This function was programmatically called via the host APIs.","HostInstanceId":"hostInstance","HttpMethod":"GET","InvocationId":"invocationId","FullName":"Functions.functionName","FunctionExecutionTimeMs":"30020.222","HttpPath":"/api/functionName","Category":"Host.Results","ProcessId":"6904"}, "Id": "bc40802d79559544", "Name": "functionName", "Url": "https://functionAppName.azurewebsites.net/api/functionName", "Success": true, "ResultCode": "200", "DurationMs": 30021.5457, "PerformanceBucket": "30sec-1min", "ItemCount": 1}]}',
]

export const appInsightsAppTraces = `{
    "records": [
        {
            "time": "2021-04-30T16:11:14.9011503Z",
            "resourceId": "/SUBSCRIPTIONS/{subscription uuid4}/RESOURCEGROUPS/{upper-case name of resource group}/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/{upper-case name of function app}",
            "ResourceGUID": "{uuid4 of resource}",
            "Type": "AppTraces",
            "AppRoleInstance": "{id of role instance}",
            "AppRoleName": "throwerror",
            "ClientIP": "0.0.0.0",
            "ClientType": "PC",
            "IKey": "{iKey}",
            "OperationId": "{operationId}",
            "_BilledSize": 803,
            "SDKVersion": "azurefunctions: 3.0.15571.0",
            "Properties": {
                "HostInstanceId": "{host instance uuid4}",
                "ProcessId": "2600",
                "LogLevel": "Information",
                "Category": "Host.LanguageWorkerConfig",
                "prop__{OriginalFormat}": "FUNCTIONS_WORKER_RUNTIME set to node. Skipping WorkerConfig for language:java"
            },
            "Message": "FUNCTIONS_WORKER_RUNTIME set to node. Skipping WorkerConfig for language:java",
            "SeverityLevel": 1,
            "ItemCount": 1
        },
        {
            "time": "2021-04-30T16:11:14.9021116Z",
            "resourceId": "/SUBSCRIPTIONS/{subscription uuid4}/RESOURCEGROUPS/{upper-case name of resource group}/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/{upper-case name of function app}",
            "ResourceGUID": "{uuid4 of resource}",
            "Type": "AppTraces",
            "AppRoleInstance": "{id of role instance}",
            "AppRoleName": "throwerror",
            "ClientIP": "0.0.0.0",
            "ClientType": "PC",
            "IKey": "{iKey}",
            "OperationId": "{operationId2}",
            "_BilledSize": 815,
            "SDKVersion": "azurefunctions: 3.0.15571.0",
            "Properties": {
                "HostInstanceId": "{host instance uuid4}",
                "ProcessId": "2600",
                "LogLevel": "Information",
                "Category": "Host.LanguageWorkerConfig",
                "prop__{OriginalFormat}": "FUNCTIONS_WORKER_RUNTIME set to node. Skipping WorkerConfig for language:powershell"
            },
            "Message": "FUNCTIONS_WORKER_RUNTIME set to node. Skipping WorkerConfig for language:powershell",
            "SeverityLevel": 1,
            "ItemCount": 1
        }
    ]
}`

export const performanceCounters = `{
    "records": [
        {
          "time": "2021-05-24T20:18:28.4650819Z",
          "resourceId": "/SUBSCRIPTIONS/{subscriptionId}/RESOURCEGROUPS/{functionAppName}/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/{resourceGroupName}",
          "ResourceGUID": "{resourceGuid}",
          "Type": "AppPerformanceCounters",
          "AppRoleInstance": "{appRoleInstance Id}",
          "AppRoleName": "{appRoleName}",
          "ClientIP": "0.0.0.0",
          "ClientType": "PC",
          "IKey": "{iKey}",
          "_BilledSize": 815,
          "SDKVersion": "af_azwapccore:2.16.0-18277",
          "Properties": {
            "HostInstanceId": "{hostInstanceId}",
            "ProcessId": "4608"
          },
          "Name": "% Processor Time",
          "Category": "Process",
          "Counter": "% Processor Time",
          "Instance": "??APP_WIN32_PROC??",
          "Value": 8.09632681121764
        },
        {
          "time": "2021-05-24T20:18:28.4651116Z",
          "resourceId": "/SUBSCRIPTIONS/{subscriptionId}/RESOURCEGROUPS/{functionAppName}/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/{resourceGroupName}",
          "ResourceGUID": "{resourceGuid}",
          "Type": "AppPerformanceCounters",
          "AppRoleInstance": "{appRoleInstance Id}",
          "AppRoleName": "{appRoleName}",
          "ClientIP": "0.0.0.0",
          "ClientType": "PC",
          "IKey": "{iKey}",
          "_BilledSize": 829,
          "SDKVersion": "af_azwapccore:2.16.0-18277",
          "Properties": {
            "HostInstanceId": "{hostInstanceId}",
            "ProcessId": "4608"
          },
          "Name": "% Processor Time Normalized",
          "Category": "Process",
          "Counter": "% Processor Time Normalized",
          "Instance": "??APP_WIN32_PROC??",
          "Value": 4.04816372935669
        },
        {
          "time": "2021-05-24T20:18:28.4651282Z",
          "resourceId": "/SUBSCRIPTIONS/{subscriptionId}/RESOURCEGROUPS/{functionAppName}/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/{resourceGroupName}",
          "ResourceGUID": "{resourceGuid}",
          "Type": "AppPerformanceCounters",
          "AppRoleInstance": "{appRoleInstance Id}",
          "AppRoleName": "{appRoleName}",
          "ClientIP": "0.0.0.0",
          "ClientType": "PC",
          "IKey": "{iKey}",
          "_BilledSize": 791,
          "SDKVersion": "af_azwapccore:2.16.0-18277",
          "Properties": {
            "HostInstanceId": "{hostInstanceId}",
            "ProcessId": "4608"
          },
          "Name": "Private Bytes",
          "Category": "Process",
          "Counter": "Private Bytes",
          "Instance": "??APP_WIN32_PROC??",
          "Value": 334188544
        },
        {
          "time": "2021-05-24T20:18:28.4651437Z",
          "resourceId": "/SUBSCRIPTIONS/{subscriptionId}/RESOURCEGROUPS/{functionAppName}/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/{resourceGroupName}",
          "ResourceGUID": "{resourceGuid}",
          "Type": "AppPerformanceCounters",
          "AppRoleInstance": "{appRoleInstance Id}",
          "AppRoleName": "{appRoleName}",
          "ClientIP": "0.0.0.0",
          "ClientType": "PC",
          "IKey": "{iKey}",
          "_BilledSize": 732,
          "SDKVersion": "af_azwapccore:2.16.0-18277",
          "Properties": {
            "HostInstanceId": "{hostInstanceId}",
            "ProcessId": "4608"
          },
          "Name": "Available Bytes",
          "Category": "Memory",
          "Counter": "Available Bytes",
          "Value": 1741344768
        },
        {
          "time": "2021-05-24T20:18:28.4651590Z",
          "resourceId": "/SUBSCRIPTIONS/{subscriptionId}/RESOURCEGROUPS/{functionAppName}/PROVIDERS/MICROSOFT.INSIGHTS/COMPONENTS/{resourceGroupName}",
          "ResourceGUID": "{resourceGuid}",
          "Type": "AppPerformanceCounters",
          "AppRoleInstance": "{appRoleInstance Id}",
          "AppRoleName": "{appRoleName}",
          "ClientIP": "0.0.0.0",
          "ClientType": "PC",
          "IKey": "{iKey}",
          "_BilledSize": 771,
          "SDKVersion": "af_azwapccore:2.16.0-18277",
          "Properties": {
            "HostInstanceId": "{hostInstanceId}",
            "ProcessId": "4608"
          },
          "Name": "IO Data Bytes/sec",
          "Category": "Process",
          "Counter": "IO Data Bytes/sec",
          "Instance": "??APP_WIN32_PROC??",
          "Value": 0
        }
    ]
}`

test("shut jest up", () => Promise.resolve(null))
