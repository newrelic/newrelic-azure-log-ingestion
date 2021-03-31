let appInsights = require('applicationinsights');
const key = process.env["APPINSIGHTS_INSTRUMENTATIONKEY"]
appInsights.setup(key)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectDependencies(true).start()

const axios = require("axios")

const httpTrigger = async function (context, req) {
    const response = await axios.get("https://httpbin.org/status/200")

    context.res = {
        status: response.status,
        body: response.statusText,
    }
}

module.exports = async function (context, req) {
    const correlationContext = appInsights.startOperation(context, req)

    return appInsights.wrapWithCorrelationContext(async () => {
        const startTime = Date.now()

        await httpTrigger(context, req)

        appInsights.defaultClient.trackRequest({
            name: context.req.method + " " + context.req.url,
            resultCode: context.res.status,
            success: true,
            url: req.url,
            duration: Date.now() - startTime,
        });
        appInsights.defaultClient.flush()
    }, correlationContext)()
}