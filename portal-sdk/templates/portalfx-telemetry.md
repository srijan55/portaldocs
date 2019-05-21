{"gitdown": "contents"}

# Portal Telemetry Overview

Ibiza portal tracks several pieces of information as users navigate through the portal. Extensions do not need to consume any APIs to have this information collected.

> **Note**: Currently, telemetry is made available to partners through Kusto. All Azure employees should have access, if you don't have access ensure you have joined your team's standard access group and it's listed here [http://aka.ms/standardaccess](http://aka.ms/standardaccess). If it is not listed then please reach out to [Ibiza Telemetry](mailto:ibiza-telemetry@microsoft.com).

You can access our Kusto cluster using <a href="https://azportal.kusto.windows.net/AzurePortal" target="_blank" title="Kusto">Kusto Explorer</a> or 
<a href="https://azportal.kusto.windows.net/AzurePortal?web=1" target="_blank" title="KustoWeb">Kusto Web Explorer</a>. 
Our Kusto cluster contains two databases: 

* AzurePortal - which contains the raw data
* AzPtlCosmos - which is our main telemetry database used in all the official dashboards and reports. Data from this database is deduped, geo-coded, expanded and has test traffic filtered out.

There are two tables used for telemetry:

* ClientTelemetry - contains telemetry logged by Framework and Hubs. In this table, you can find all the telemetry events (e.g. BladeLoaded, PartLoaded) which are logged by default for any extension which is registered in the portal.
* ExtTelemetry - contains extension telemetry. As an extension author, you may log additional telemetry to this table. 
    * *Note*: Your extension will log to this table only if you have onboarded to the telemetry services provided by Framework.

You can read more [here](portalfx-telemetry-kusto-databases.md) about Kusto and about the data provided in our Kusto cluster.

### Tracked Actions

{"gitdown": "include-file", "file": "portalfx-telemetry-actions.md"}

## Logging

There are two options for collecting telemetry and error/warning logs. You can either configure and use the Portal Framework's built-in telemetry services or you can utilize an entirely custom telemetry system.

> We advise you to use the telemetry controller provided by Framework in order to take advantage of the system which is already in place.

> Information should be collected in a way that that ensures no personally identifiable information (PII) is captured. It is very important for security and compliance reasons that PII data is not sent to telemetry services and you should have practices in place to ensure that this is enforced.

### Onboarding to ExtTelemetry/ExtEvents tables

To start using the built-in controller provided by Framework for collecting telemetry and error/warning logs, just add `this.EnablePortalLogging = true;` in the constructor of your extension definition class:

```cs
  public Definition(ApplicationConfiguration applicationConfiguration)
  {
      this.EnablePortalLogging = true;
  }
```

You can read [here](portalfx-telemetry-logging.md) more details about using the telemetry controller provided by Framework.

### Logging telemetry to ExtTelemetry table

You can use the Portal telemetry APIs to log telemetry. However, before you do so you will need to initialize the telemetry service.

```ts
  // Initialize the telemetry functionality and make it available for use.
  MsPortalFx.Base.Diagnostics.Telemetry.initialize("ExtensionName");
```

> Note that you don't need to trace browser information to your particular extension as this data is collected globally. However, if you would like the browser information in your own telemetry store set traceBrowserInformation to true.

To log telemetry, you can call the `trace` method as shown below:

```ts
  MsPortalFx.Base.Diagnostics.Telemetry.trace({
      extension: "Microsoft_Azure_NewExtension",
      source: "Links",
      action: "LinkClicked",
      name: "Recommended",
      data: {...}
  });
```

Telemetry logs go to ExtTelemetry table, which is available in Kusto in both AzurePortal and AzPtlCosmos databases.
The recommended format for `name` column is 'Extension/Microsoft_Azure_NewExtension/Blade/NewBladeName', if the event is related to a blade. 
Please do not stringify `data` and `context` columns when passing them through. These columns usually contain JSON values. You should pass their values as objects, as otherwise, this will result in double-encoded strings. 

### Logging errors/warnings to ExtEvents table

To log errors/warnings, you can call the `error`/`warning` methods as shown below:

```ts
  var log = new MsPortalFx.Base.Diagnostics.Log("logging_area");
  log.warning(errorMessage, code, args);
  log.error(errorMessage, code, args);
```

Args can be provided for additional information to get logged together with the message. Pass it as an object and do not stringify it before passing it through.

Errors and warnings are logged to ExtEvents table, which is available in Kusto only in AzurePortal database.

**NOTE:** Verbose logging is currently disabled in mpac/production, in order to prevent overly aggressive logging. We recommend you to use verbose logging only for debugging.

We have built [Extension Errors Dashboard](portalfx-telemetry-extension-errors.md) for giving you the ability to analyze easier the errors and warnings thrown by your extension.

**NOTE:**  In the charts from [Extension Errors Dashboard](portalfx-telemetry-extension-errors.md), we aggregate the error messages by omitting the text which is within double quotes (") or single quotes ('). We consider those parts to be the dynamic part of the message (e.g. an id, a timestamp etc.). For example, a message like [Could not find part "PartName1"] will be treated as [Could not find part ""]. Please use this format for all the logged error messages, if you want them to be aggregated by our queries.

## Available Power BI Dashboards

Following are some of the dashboards that we support. If you do not have access to any of these please contact [ibiza-telemetry@microsoft.com](mailto:ibiza-telemetry@microsoft.com)

|Name                            | PowerBi Link                                                                                                                                     | Metrics Description                                                                    |
|--------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
|Portal Performance Dashboard    | [http://aka.ms/portalfx/dashboard/extensionperf](http://aka.ms/portalfx/dashboard/extensionperf)                                         | [Perf Docs](portalfx-performance.md)                              |
|Portal Reliability Dashboard    | [http://aka.ms/portalfx/dashboard/extensionperf](http://aka.ms/portalfx/dashboard/extensionperf)                                          | [Reliability Docs](portalfx-reliability.md)                       |
|Portal Create Dashboard         | [http://aka.ms/portalfx/dashboard/PortalCreate](http://aka.ms/portalfx/dashboard/PortalCreate)                                                   | [Create Docs](portalfx-telemetry-create.md)                       |
|Extension Errors Dashboard      | [http://aka.ms/portalfx/dashboard/ExtensionErrors](http://aka.ms/portalfx/dashboard/ExtensionErrors)                                             | [Extension Errors Docs](portalfx-telemetry-extension-errors.md)   |


## Collecting Feedback From Your Users

In February 2016 we introduced a standardized pane for collecting user feedback. We currently expose one method to extension developers.

### Resource Deleted Survey

To ask a user why they deleted a resource use the `openResourceDeletedFeedbackPane` method:

```
  import * as FxFeedback from "Fx/Feedback";
  FxFeedback.openResourceDeletedFeedbackPane("displayNameOfTheDeletedResource", optionalObjectWithAnyAdditionalDataYouWantToLog);
```

Call this method after a user starts the deletion process for a resource. Shell will open the feedback pane with a standardized survey. The name of the resource you pass to the method will be shown to the user in the survey. Responses to this survey are logged to the telemetry tables. If the feedback pane is already open calls to this method will be no-ops.

### Questions?

Read more about [Kusto query language](https://kusto.azurewebsites.net/docs/queryLanguage/query_language.html).

Ask questions on: [https://stackoverflow.microsoft.com/questions/tagged?tagnames=ibiza-telemetry](https://stackoverflow.microsoft.com/questions/tagged?tagnames=ibiza-telemetry)

