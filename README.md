[![Community Project header](https://github.com/newrelic/opensource-website/raw/master/src/images/categories/Community_Project.png)](https://opensource.newrelic.com/oss-category/#community-project)

# newrelic-azure-log-ingestion [![Build Status](https://github.com/newrelic/newrelic-azure-log-ingestion/actions/workflows/main.yml/badge.svg)](https://github.com/newrelic/newrelic-azure-log-ingestion/actions/workflows/main.yml)

An Azure Resource Manager template to ingest Azure Monitoring logs, metrics and traces into New Relic.

## Installation

This integration requires both a New Relic and Azure account.

* If you don't have a NewRelic account yet, you can [create one for free](https://newrelic.com/signup).
* If you don't have an Azure account yet, you can [create one for free](https://azure.microsoft.com/en-us/free/).

### Install Using Azure Portal

Retrieve your [New Relic Insights Insert Key](https://docs.newrelic.com/docs/apis/get-started/intro-apis/new-relic-api-keys/#insights-insert-key).

Then click the button below to start the installation process via the Azure Portal.

[![Deploy to Azure](https://azuredeploy.net/deploybutton.png)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fnewrelic%2Fnewrelic-azure-log-ingestion%2Fmain%2Ftemplates%2Fazure-log-ingestion.json)

### Install Using Azure CLI

1. Install the [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli).
2. Retrieve your [New Relic Insights Insert Key](https://docs.newrelic.com/docs/apis/get-started/intro-apis/new-relic-api-keys/#insights-insert-key).
3. Run `az login` to login to Azure.
4. Run `az group create --name NewRelicLogs --location uswest`
   to create an Azure Resource Group. Replace `NewRelicLogs` with your preferred
   Resource Group name and `westus` with your prefered Azure location. This step is
   optional but recommended. If you have an existing Resource Group you want to use,
   you can skip this step.
5. Deploy the Resource Manager template:

     ```
       az deployment group create \
         -    --name NewRelicLogs \
         --resource-group NewRelicLogs \
         --template-uri https://raw.githubusercontent.com/newrelic/newrelic-azure-log-ingestion/main/templates/azure-log-ingestion.json \
         --parameters NewRelicInsertKey=<new relic insert key here>
       ```

     Make sure the `--resource-group` argument is the same as the one you created in
     the previous step. Also make sure you replace `<new relic insert key here>`
     with your New Relic Insert Key.

## Getting Started

Now that you have your New Relic reporting stack setup in your Azure account, you need
to configure your App Insights resources to start sending telemetry data to it.

### Automatic Reporting with Azure Policy

You can automatically configure your Function Apps to report App Insights telemetry to
New Relic using an [Azure Policy](https://docs.microsoft.com/en-us/azure/azure-monitor/deploy-scale).

This is the easiest option as it only needs to be setup once and all existing and future
App Insights resources will be automatically configured to report to New Relic. Keep in
mind there are costs associated with exporting telemetry data from Azure. You will want
to monitor the Consumption Group created by this integration to ensure they meet your
expectations.

To setup this Azure Policy, rrun the below command using the Azure CLI:

```
az deployment group create \
  --name NewRelicLogsPolicy \
  --resource-group NewRelicLogs \
  --template-uri https://raw.githubusercontent.com/newrelic/newrelic-azure-log-ingestion/main/templates/azure-policy.json
```

Replacing, as necessary, the `--resource-group` argument with the ResourceGroup
that you created during installation.

### Manually Configure Diagnostic Settings

You can manually configure [Diagnostic Settings](https://docs.microsoft.com/en-us/azure/azure-monitor/essentials/diagnostic-settings)
for only the App Insights resources you want to report telemetry data to New Relic. This
option is more involved, but offers more fine grained control over the telemetry data
being exported.

1. Find the App Function you want to export telemetry data from in the Azure Portal.
2. In the resource's menu, click **Diagnostic Settings** under **Monitor**.
3. Click **Add diagnostic setting**.
4. Enter a **Name** for your setting.
5. Under **Category details**, Check the box for each category of data you want to export to New Relic.
6. Under **Destination details**, check the **Event Hub** box.
7. Under the Event Hub destination configuration, you'll need to specify the following:
     * The subscription which the event hub is part of. This should be the same
       subscription used during the installation steps above.
     * The Event hub namespace. This should be `NewRelicLogs`.
     * An Event hub name. This should be `newrelic-log-ingestion`.
     * An Event Hub policy. The policy selected must grant the permissions
       necessary to stream data to the Event Hub.
8. Click **Save**.

After a few moments, the new setting appears in your list of settings for this
resource, and logs are streamed to the specified destination as new event data
is generated.

See the [Azure documentation](https://docs.microsoft.com/en-us/azure/azure-monitor/essentials/diagnostic-settings) for details.

## Usage
>[**Optional** - Include more thorough instructions on how to use the software. This section might not be needed if the Getting Started section is enough. Remove this section if it's not needed.]


## Building

1. Run `npm install` to install the dependencies.
2. Run `npm run build` to run the build.

## Testing

Run `npm test` to run tests.

## Support

New Relic hosts and moderates an online forum where customers can interact with New Relic employees as well as other customers to get help and share best practices. Like all official New Relic open source projects, there's a related Community topic in the New Relic Explorers Hub. You can find this project's topic/threads here:

>Add the url for the support thread here: discuss.newrelic.com

## Contribute

We encourage your contributions to improve newrelic-azure-log-ingestion! Keep in mind that when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. You only have to sign the CLA one time per project.

If you have any questions, or to execute our corporate CLA (which is required if your contribution is on behalf of a company), drop us an email at opensource@newrelic.com.

**A note about vulnerabilities**

As noted in our [security policy](../../security/policy), New Relic is committed to the privacy and security of our customers and their data. We believe that providing coordinated disclosure by security researchers and engaging with the security community are important means to achieve our security goals.

If you believe you have found a security vulnerability in this project or any of New Relic's products or websites, we welcome and greatly appreciate you reporting it to New Relic through [HackerOne](https://hackerone.com/newrelic).

If you would like to contribute to this project, review [these guidelines](./CONTRIBUTING.md).

To all contributors, we thank you!  Without your contribution, this project would not be what it is today.  We also host a community project page dedicated to [Project Name](<LINK TO https://opensource.newrelic.com/projects/... PAGE>).

## License
newrelic-azure-log-ingestion is licensed under the [Apache 2.0](http://apache.org/licenses/LICENSE-2.0.txt) License.
