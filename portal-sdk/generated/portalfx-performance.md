* [Performance Overview](#performance-overview)
    * [Extension-loading performance](#performance-overview-extension-loading-performance)
    * [Blade performance](#performance-overview-blade-performance)
    * [Part performance](#performance-overview-part-performance)
    * [WxP score](#performance-overview-wxp-score)
    * [How to assess your performance](#performance-overview-how-to-assess-your-performance)
        * [Extension-loading](#performance-overview-how-to-assess-your-performance-extension-loading)
        * [Blade](#performance-overview-how-to-assess-your-performance-blade)
        * [Part](#performance-overview-how-to-assess-your-performance-part)
* [Performance Frequently Asked Questions (FAQ)](#performance-frequently-asked-questions-faq)
    * [My Extension 'load' is above the bar, what should I do](#performance-frequently-asked-questions-faq-my-extension-load-is-above-the-bar-what-should-i-do)
    * [My Blade 'FullReady' is above the bar, what should I do](#performance-frequently-asked-questions-faq-my-blade-fullready-is-above-the-bar-what-should-i-do)
    * [My Part 'Ready' is above the bar, what should I do](#performance-frequently-asked-questions-faq-my-part-ready-is-above-the-bar-what-should-i-do)
    * [My WxP score is below the bar, what should I do](#performance-frequently-asked-questions-faq-my-wxp-score-is-below-the-bar-what-should-i-do)
    * [Is there any way I can get further help](#performance-frequently-asked-questions-faq-is-there-any-way-i-can-get-further-help)
* [Performance best practices](#performance-best-practices)
    * [Checklist](#performance-best-practices-checklist)
    * [Operational best practices](#performance-best-practices-operational-best-practices)
    * [Coding best practices](#performance-best-practices-coding-best-practices)
    * [General best practices](#performance-best-practices-general-best-practices)
* [Extension load shim dependencies (removing shims)](#extension-load-shim-dependencies-removing-shims)
    * [How to fix shim usage](#extension-load-shim-dependencies-removing-shims-how-to-fix-shim-usage)
        * [Converting your shim to an AMD module](#extension-load-shim-dependencies-removing-shims-how-to-fix-shim-usage-converting-your-shim-to-an-amd-module)
* [Using the Portal's ARM token](#using-the-portal-s-arm-token)
    * [Ensure you verify:](#using-the-portal-s-arm-token-ensure-you-verify)
    * [Changes required](#using-the-portal-s-arm-token-changes-required)
* [V2 targets](#v2-targets)
    * [Prerequisites](#v2-targets-prerequisites)
    * [Get your extension building with tsconfig.json](#v2-targets-get-your-extension-building-with-tsconfig-json)
    * [Get extension building using V2 targets](#v2-targets-get-extension-building-using-v2-targets)
    * [Enabling CloudBuild support](#v2-targets-enabling-cloudbuild-support)
    * [Common errors](#v2-targets-common-errors)
    * [Breaking changes between V1 and V2 targets](#v2-targets-breaking-changes-between-v1-and-v2-targets)
* [Dependency injected view models](#dependency-injected-view-models)
    * [Prerequistes](#dependency-injected-view-models-prerequistes)
    * [Migration steps](#dependency-injected-view-models-migration-steps)
    * [Pull Request Samples](#dependency-injected-view-models-pull-request-samples)
* [Performance profiling](#performance-profiling)
    * [How to profile your scenario](#performance-profiling-how-to-profile-your-scenario)
    * [Identifying common slowdowns](#performance-profiling-identifying-common-slowdowns)
    * [Verifying a change](#performance-profiling-verifying-a-change)


<a name="performance-overview"></a>
# Performance Overview

Portal performance from a customer's perspective is seen as all experiences throughout the product. 
As an extension author you have a duty to uphold your experience to the performance bar at a minimum.

| Area      | 95th Percentile Bar | Telemetry Action         | How is it measured? |
| --------- | ------------------- | ------------------------ | ------------------- |
| Extension | < 4 secs       | ExtensionLoad            | The time it takes for your extension's home page to be loaded and initial scripts, the `initialize` call to complete within your Extension definition file  |
| Blade     | < 4 secs       | BladeFullReady           | The time it takes for the blade's `onInitialize` or `onInputsSet` to resolve and all the parts on the blade to become ready |
| Part      | < 4 secs       | PartReady                | Time it takes for the part to be rendered and then the part's OnInputsSet to resolve |
| WxP       | > 80       | N/A                      | An overall experience score, calculated by weighting blade usage and the blade full ready time |

<a name="performance-overview-extension-loading-performance"></a>
## Extension-loading performance

Extension-loading performance effects both Blade and Part performance, as your extension is loaded and unloaded as and when it is required.
In the case where a user is visiting your resource blade for the first time, the Fx will load up your extension and then request the view model, consequently your Blade/Part performance is affected.
If the user were to browse away from your experience and browse back before your extension is unloaded, obviously the user's second visit will be faster, as they don't pay the cost of loading the extension.

This time captures:

1. The downloading of your extensions homepage
1. The parsing and execution of the required framework scripts in your iframe
    - This work has already happened outside of your extension load if your extension uses prewarming 
1. The downloading, parsing, and execution of your obsolete bundles
    - If you have any
1. The downloading, parsing, and execution of your shims
    - If you have any
1. The downloading, parsing, and execution of your extensions initial bundles
    - This can be reduce by migrating to dependency injection
1. The downloading, parsing, and execution of your extensions resources bundle
    - This can be parallelized with your initial bundles if you upgrade to SDK 5.0.302.5601+
1. The handshake from your extension to the framework stating your extension is ready
    - Completion of your initialize method in your Program.ts declaration 


<a name="performance-overview-blade-performance"></a>
## Blade performance

Blade performance is spread across a couple of main areas:

1. Blade's constructor
1. Blade's 'onInitialize' or 'onInputsSet'
1. (PDL-based `<Blade>` only) Any Parts nested within the Blade become ready

If your blade is a FrameBlade or AppBlade there is an additional initialization message from your iframe to your viewmodel which is also tracked, see the samples extension [framepage.js](https://msazure.visualstudio.com/One/Azure%20Portal/_git/AzureUX-PortalFx?path=%2Fsrc%2FSDK%2FAcceptanceTests%2FExtensions%2FSamplesExtension%2FExtension%2FContent%2FScripts%2Fframepage.js&version=GBproduction&_a=contents) for an example of what messages are required.

All of these perf costs are represented under the one 'BladeFullReady' action.

<a name="performance-overview-part-performance"></a>
## Part performance

Similar to Blade performance, Part performance is spread across a couple of areas:

1. Part's constructor
1. Part's 'onInitialize' or 'onInputsSet'

If your part is a FramePart there is an additional initialization message from your iframe to your viewmodel which is also tracked, see the samples extension [framepage.js](https://msazure.visualstudio.com/One/Azure%20Portal/_git/AzureUX-PortalFx?path=%2Fsrc%2FSDK%2FAcceptanceTests%2FExtensions%2FSamplesExtension%2FExtension%2FContent%2FScripts%2Fframepage.js&version=GBproduction&_a=contents) for an example of what messages are required.

All of these perf costs are represented under the one 'PartReady' action.

<a name="performance-overview-wxp-score"></a>
## WxP score

The WxP score is a per extension Weight eXPerience score (WxP). It is calculated by the Azure Portal team as follows:

```txt

WxP = (BladeViewsMeetingTheBar * 95thPercentileBar) / ((BladeViewsMeetingTheBar * 95thPercentileBar) + ∑(BladeViewsNotMeetingTheBar * ActualLoadTimePerBlade))

```

| Blade   | 95th Percentile Times | Usage Count | Meets 95th Percentile Bar? |
| ------- | --------------------- | ----------- | -------------------------- |
| Blade A | 1.2                   | 1000        | Yes                        |
| Blade B | 5                     | 500         | No                         |
| Blade C | 6                     | 400         | No                         |

```txt

WxP = (BladeViewsMeetingTheBar * 95thPercentileBar) / ((BladeViewsMeetingTheBar * 95thPercentileBar) + ∑(BladeViewsNotMeetingTheBar * ActualLoadTimePerBlade)) %
    = (4 * 1000) / ((4 * 1000) + ((5 * 500) + (6 * 400))) %
    = 44.94%

```

> Note: The model penalizes extensions for blades which have a higher number of views and don’t meet the bar.

<a name="performance-overview-how-to-assess-your-performance"></a>
## How to assess your performance

There are two methods to assess your performance:

1. Visit the IbizaFx provided PowerBi report*
1. Run Kusto queries locally to determine your numbers

    (*) To get access to the PowerBi dashboard reference the [Telemetry onboarding guide][TelemetryOnboarding], then access the following [Extension performance/reliability report][Ext-Perf/Rel-Report]

The first method is definitely the easiest way to determine your current assessment as this is maintained on a regular basis by the Fx team.
You can, if preferred, run queries locally but ensure you are using the Fx provided Kusto functions to calculate your assessment.

<a name="performance-overview-how-to-assess-your-performance-extension-loading"></a>
### Extension-loading

[database('Partner').ExtensionPerformance(ago(1h), now())](https://aka.ms/kwe?cluster=azportal.kusto.windows.net&database=AzurePortal&q=H4sIAAAAAAAAA0tJLElMSixO1VAPSCwqyUstUtfUc60oSc0rzszPC0gtSssvyk3MS07VSEzP1zDM0NRRyMsv19DU5AIAxF6Q5zkAAAA%3D)

ExtensionPerformance will return a table with the following columns:

- Extension
  - The name of the extension
- Loads
  - How many times the extension was loaded within the given date range
- 50th, 80th, 95th
  - The time it takes for your extension to initialize. This is captured under the `ExtensionLoad` action in telemetry
- HostingServiceloads
  - The number of loads from the hosting service
- UsingTheHostingService
  - If the extension is predominantly using the hosting service in production

<a name="performance-overview-how-to-assess-your-performance-blade"></a>
### Blade

[database('Partner').BladePerformanceIncludingNetwork(ago(1h), now())](https://aka.ms/kwe?cluster=azportal.kusto.windows.net&database=AzurePortal&q=H4sIAAAAAAAAA0tJLElMSixO1VAPSCwqyUstUtfUc8pJTEkNSC1Kyy%2FKTcxLTvXMS84pTcnMS%2FdLLSnPL8rWSEzP1zDM0NRRyMsv19DU5AIA1W5beEUAAAA%3D)

With the `BladePerformanceIncludingNetwork` function, we sample 1% of traffic to measure the number of network requests that are made throughout their session, that sampling does not affect the overall duration that is reported. Within the function we will correlate the count of any network requests, these are tracked in telemetry under the action `XHRPerformance`, made when the user is loading a given blade. It does not impact the markers that measure performance. That said a larger number of network requests will generally result in slower performance.

The subtle difference with the standard `BladeFullReady` marker is that if the blade is opened within a resource menu blade we will attribute the time it takes to resolve the `getMenuConfig` promise as the resource menu blade is loaded to the 95th percentile of the 'BladeFullReady' duration. This is attributed using a proportional calculation based on the number of times the blade is loaded inside the menu blade.

For example, a blade takes 2000ms to complete its `BladeFullReady` and 2000ms to return its `getMenuConfig`.
It is only loaded once (1) in the menu blade out of its 10 loads. Its overall reported FullDuration would be 2200ms.

BladePerformanceIncludingNetwork will return a table with the following columns

- FullBladeName, Extension, BladeName
  - Blade/Extension identifiers
- BladeCount
  - The number of blade loads within the given date range
- InMenuLoads
  - The number of in menu blade loads within the given date range
- PctOfMenuLoads
  - The percentage of in menu blade loads within the given date range
- Samples
  - The number of loads which were tracking the number of XHR requests
- StaticMenu
  - If the `getMenuConfig` call returns within < 10ms, only applicable to ResourceMenu cases
- MenuConfigDuration95
  - The 95th percentile of the `getMenuConfig` call
- LockedBlade
  - If the blade is locked, ideally blades are now template blades or no-pdl
  - All no-pdl and template blades are locked, pdl blades can be made locked by setting the locked property to true
- XHRCount, XHRCount95th, XHRMax
  - The 50th percentile (95th or MAX) of XHR requests sent which correlate to that blade load
- Bytes
  - Bytes transferred to the client via XHR requests
- FullDuration50, 80, 95, 99
  - The time it takes for the `BladeFullReady` + (`PctOfMenuLoads` * the `getMenuConfig` to resolve)
- RedScore
  - Number of violations for tracked bars
- AlertSeverity
  - If the blade has opted to be alerted against via the [alerting infrastructure](index-portalfx-extension-monitor.md#performance) and what severity the alert will open at.

<a name="performance-overview-how-to-assess-your-performance-part"></a>
### Part

[database('Partner').PartPerformance(ago(1h), now())](https://aka.ms/kwe?cluster=azportal.kusto.windows.net&database=AzurePortal&q=H4sIAAAAAAAAA0tJLElMSixO1VAPSCwqyUstUtfUA7ECUovS8otyE%2FOSUzUS0%2FM1DDM0dRTy8ss1NDW5AIGipTc0AAAA)

PartPerformance will return a table with the following columns:

- FullPartName, Extension, PartName
  - Part/Extension identifiers
- PartCount
  - How many times the part was loaded within the given date range
- Samples
  - The number of loads which were tracking the number of XHR requests
- XHRCount, XHRCount95th, XHRMax
  - The 50th percentile (95th or MAX) of XHR requests sent which correlate to that part load (*) This is a rough heuristic, based on a 1% sampling.
- Bytes
  - Bytes transferred to the client via XHR requests
- 50th, 80th, 95th, 99th
  - The time it takes for your part to resolve its `onInputsSet` or `onInitialize` promise. This is captured under the `PartReady` action in telemetry
- RedScore
   Number of violations for tracked bars

<a name="performance-frequently-asked-questions-faq"></a>
# Performance Frequently Asked Questions (FAQ)

<a name="performance-frequently-asked-questions-faq-my-extension-load-is-above-the-bar-what-should-i-do"></a>
## My Extension &#39;load&#39; is above the bar, what should I do

1. Profile what is happening in your extension load. [Profile your scenario](#performance-profiling)
1. Are you using the Portal's ARM token? If no, verify if you can use the Portal's ARM token and if yes, follow: [Using the Portal's ARM token](#using-portals-arm-token)
1. Are you on the hosting service? If no, migrate to the hosting service: [Hosting service documentation](portalfx-extension-hosting-service.md#extension-hosting-service)
    - If you are, have you enabled prewarming? 
        - Follow http://aka.ms/portalfx/docs/prewarming to enable prewarming for your extension load.
1. Are you using obsolete bundles? 
    - If yes, remove your dependency to them and then remove the obsolete bitmask. This is a blocking download before your extension load. See below for further details.
1. See our [best practices](#performance-best-practices)

<a name="performance-frequently-asked-questions-faq-my-blade-fullready-is-above-the-bar-what-should-i-do"></a>
## My Blade &#39;FullReady&#39; is above the bar, what should I do

1. Assess what is happening in your Blades's `onInitialize` (no-PDL) or constructor and `onInputsSet` (PDL). [Profile your scenario](#performance-profiling)
    1. Can that be optimized?
1. If there are any AJAX calls;
    1. Can they use batch? If so, migrate over to use the [batch api](http://aka.ms/portalfx/docs/batch).
    1. Wrap them with custom telemetry and ensure they you aren't spending a large amount of time waiting on the result. If you are to do this, please only log one event per blade load, this will help correlate issues but also reduce unneccesary load on telemetry servers.
1. Are you using an old PDL "Blade containing Parts"? How many parts are on the blade?
    - If there is only a single part, if you're not using a no-pdl blade or `<TemplateBlade>` migrate your current blade to a no-pdl blade.
    - If there are multiple parts, migrate over to use a no-pdl blade.
    - Ensure to support any old pinned parts when you migrate.
1. Does your blade open within a resource menu blade?
    - If it does, ensure the `getMenuConfig` call is returned statically/synchronously (< 10ms). You can make use of the enabled/disabled observable property on menu items, if you need to asynchronously determine to enable a menu item. 
1. See our [best practices](#performance-best-practices)

<a name="performance-frequently-asked-questions-faq-my-part-ready-is-above-the-bar-what-should-i-do"></a>
## My Part &#39;Ready&#39; is above the bar, what should I do

1. Assess what is happening in your Part's `onInitialize` (no-PDL) or constructor and `onInputsSet` (PDL), including time taken in any async operations associated with the returned Promise. [Profile your scenario](#performance-profiling)
    1. Can that be optimized?
1. If there are any AJAX calls;
    1. Can they use batch? If so, migrate over to use the [batch api](http://aka.ms/portalfx/docs/batch).
    1. Wrap them with custom telemetry and ensure they you aren't spending a large amount of time waiting on the result. If you are to do this, please only log one event per part load, this will help correlate issues but also reduce unneccesary load on telemetry servers.
1. See our [best practices](#performance-best-practices)

<a name="performance-frequently-asked-questions-faq-my-wxp-score-is-below-the-bar-what-should-i-do"></a>
## My WxP score is below the bar, what should I do

Using the [Extension performance/reliability report][Ext-Perf/Rel-Report] you can see the WxP impact for each individual blade. Although given the Wxp calculation,
if you are drastically under the bar its likely a high usage blade is not meeting the performance bar, if you are just under the bar then it's likely it's a low usage
blade which is not meeting the bar.

<a name="performance-frequently-asked-questions-faq-is-there-any-way-i-can-get-further-help"></a>
## Is there any way I can get further help

Sure! Book in some time in the Azure performance office hours.

- __When?__  Wednesdays from 13:00 to 16:00
- __Where?__ B41 (Conf Room 41/24)
- __Contacts:__ Sean Watson (sewatson)
- __Goals__
  - Help extensions to meet the performance bar
  - Help extensions to measure performance
  - Help extensions to understand their current performance status
- __How to book time__: Send a meeting request with the following
  - TO: sewatson;
  - Subject: YOUR_EXTENSION_NAME: Azure performance office hours
  - Location: Conf Room 41/24 (It is already reserved)

<a name="performance-best-practices"></a>
# Performance best practices

<a name="performance-best-practices-checklist"></a>
## Checklist

- Migrate to the [hosting service](portalfx-extension-hosting-service.md#extension-hosting-service)
- Enable [prewarming](http://aka.ms/portalfx/docs/prewarming), running your extension in a web worker
- Ensure your extension isn't using [shims](#extension-load-shim-dependencies-removing-shims)
- Ensure your extension isn't using [obsolete bundles](https://aka.ms/portalfx/obsoletebundles)
- Use the [Portal's ARM delegation token](#using-the-portals-arm-token)
- Migrate your extension to [dependency injection](#dependency-injected-view-models)
- Ensure you aren't making any network requests in your extension boot path (Program.ts file)

<a name="performance-best-practices-operational-best-practices"></a>
## Operational best practices

- Move to [hosting service](portalfx-extension-hosting-service.md#extension-hosting-service)
  - We've seen every team who have onboarded to the hosting service get some performance benefit from the migration.
    - Performance benefits vary from team to team given your current infrastructure
    - We've commonly seen teams improve their performance by > 0.5s at the 95th  
  - If you are not on the hosting service ensure;
      1. [Homepage caching](portalfx-performance-caching-homepage.md) is enabled
      1. [Persistent content caching](portalfx-extension-persistent-caching-of-scripts.md) is enabled
      1. [Compression](#v2-targets) is enabled
      1. Your service is efficiently geo-distributed (Note: we have seen better performance from having an actual presence in a region vs a CDN)
- Compression (Brotli)
  - Move to V2 targets to get this by default, see [V2 targets](#v2-targets)
- Use the [Portal's ARM delegation token](#using-the-portals-arm-token)
- Remove controllers
  - Don't proxy ARM through your controllers
- Don't require full libraries to make use of a small portion
  - Is there another way to get the same result?
- Enable performance alerts
  - To ensure your experience never regresses unintentionally, you can opt into configurable alerting on your extension, blade and part load times. See [performance alerting](index-portalfx-extension-monitor.md#performance)
- If you're using iframe experiences
    1. Ensure you have the correct caching enabled
    1. Ensure you have compression enabled
    1. Your bundling logic is optimised
    1. Are you serving your iframe experience geo-distributed efficiently?

<a name="performance-best-practices-coding-best-practices"></a>
## Coding best practices

- Reduce network calls
  - Ideally 1 network call per blade
  - Utilise `batch` to make network requests, see our [batch documentation](http://aka.ms/portalfx/docs/batch)
- Don't use old PDL blades composed of parts: [hello world template blade](portalfx-no-pdl-programming.md#building-a-hello-world-template-blade-using-decorators)
  - Each part on the blade has its own viewmodel and template overhead, switching to a no-pdl template blade will mitigate that overhead
- Remove automatic polling
  - If you need to poll, only poll on the second request and ensure `isBackgroundTask: true` in the batch call
- Remove all dependencies on obsoleted code
  - Loading any required obsoleted bundles is a blocking request during your extension load times
  - See https://aka.ms/portalfx/obsoletebundles for further details
- Use the latest controls available: see https://aka.ms/portalfx/playground
  - This will minimise your observable usage
  - The newer controls are AMD'd reducing what is required to load your blade
- Remove Bad CSS selectors
  - Build with warnings as errors and fix them
  - Bad CSS selectors are defined as selectors which end in HTML elements for example `.class1 .class2 .class3 div { background: red; }`
    - Since CSS is evaluated from right-to-left the browser will find all `div` elements first, this is obviously expensive
- Don't use extension level defined style sheets
    - These can be declared as `<Stylesheet>` unscoped to Blades or Parts in PDL
- Fix your telemetry
  - Ensure you are returning the relevant blocking promises as part of your initialization path (`onInitialize` or `onInputsSet`), today you maybe cheating the system but that is only hurting your users.
  - Ensure your telemetry is capturing the correct timings

<a name="performance-best-practices-general-best-practices"></a>
## General best practices

- Test your scenarios at scale
  - How does your scenario deal with 100s of subscriptions or 1000s of resources?
  - Are you fanning out to gather all subscriptions, if so do not do that.
    - Limit the default experience to first N subscriptions and have the user determine their own scope.
- Develop in diagnostics mode
  - Use https://portal.azure.com?trace=diagnostics to detect console performance warnings
    - Using too many defers
    - Using too many ko.computed dependencies
- Be wary of observable usage
  - Try not to use them unless necessary
  - Don't aggressively update UI-bound observables
    - Accumulate the changes and then update the observable
    - Manually throttle or use `.extend({ rateLimit: 250 });` when initializing the observable

<a name="extension-load-shim-dependencies-removing-shims"></a>
# Extension load shim dependencies (removing shims)

Extension load shim dependencies are dependencies that are hardcoded into your require config to be downloaded and executed before any other script can be executed.
Because of the way shims work in requireJS, no assumption can be made about their usage and you end up blocking download and execution of any dependent script until
shims are all fully downloaded and executed. For most extensions today, at best (latest SDK), what this translates to is a shim bundle being downloaded concurrently
 with your extension's entrypoint bundle, meaning a blocking download of OSS libraries that delays any work to initialize your extension.

<a name="extension-load-shim-dependencies-removing-shims-how-to-fix-shim-usage"></a>
## How to fix shim usage

To fix this, you have a few options:

1. Reevaluate the need for that library
    - We've seen giant OSS libraries being pulled for very little functionality that the Portal actually provided or that could have been extracted/reimplemented with way less code downloaded, so confirming you really need said library is the first thing you should look into.
1. Convert the library to an AMD module
    - By converting the library to an AMD module and adding an amd-dependency tag to files that really need it, you enable the Portal's bundler to bundle said library with its owners (saving a network round-trip) and you move it out of the extension init path.

<a name="extension-load-shim-dependencies-removing-shims-how-to-fix-shim-usage-converting-your-shim-to-an-amd-module"></a>
### Converting your shim to an AMD module

Converting your OSS library to an AMD module is very straightforward in most cases.
What you want to do is wrap all of the library’s code with a define statement like this:

```typescript
    define([], function() {
        /** OSS code here **/
    });
```

Taking an actual file as an example, here's the diff for the hammer.js OSS library:

```txt
    --------------------------------------------------------------------------
    4    4       * Copyright (c) 2014 Jorik Tangelder <j.tangelder@gmail.com>;
    5    5       * Licensed under the MIT license */

         7     + define([], function () {
    7    8       (function (window, undefined) {
    8    9           'use strict';

    10   11          /**
    --------------------------------------------------------------------------
    2156 2157        window.Hammer = Hammer;

    2158 2159    })(window);
    2159 2160  + });
    --------------------------------------------------------------------------
```

The next step is to add an amd-dependency tag to all the files that use the aforementioned OSS library so that the TypeScript to JavaScript transpilation generates an explicit dependency for it.

Simply insert:

```typescript
/// <amd-dependency path="dependencyPath" />
```

At the top of your file, where dependencyPath is the path to your AMD OSS library. For hammer.js:

```typescript
/// <amd-dependency path="hammer" />
```

Finally, since the bundler will now automatically pick up the library’s file and bundle it properly, you can remove the shim code from your C#; you can find said code by looking for derived classes of `ContentBundleDefinition`.

This should cover the vast majority of shim-to-AMD conversion cases.
For more information, please create a stack overflow question (https://aka.ms/portalfx/ask) and reach out to ibizaperfv@microsoft.com.

<a name="using-the-portal-s-arm-token"></a>
# Using the Portal&#39;s ARM token

If you aren't using the Portal's ARM token today, there will be a blocking request to gather your custom token before your extension can call ARM. This drastically hurts performance and even more so at the higher percentiles.

Below is an example PR of another team making this change.
https://msazure.visualstudio.com/One/_git/AzureUX-PortalFx/pullrequest/867497?_a=overview

<a name="using-the-portal-s-arm-token-ensure-you-verify"></a>
## Ensure you verify:
- If you do not require your own token, and you currently aren’t relying on server side validation of the token you should be able to make the change easily.
- If you do require your own token, assess if that is necessary and migrate to the Portal’s token if possible.
- If you’re relying on server side validation, please update that validation to validate the Portal App Id instead – if that is sufficient for you.

To fix this it is a simple change to the Portal’s config here: http://aka.ms/portalfx/extensionsprodjson
See below for further details.

Please send a pull request to the portal’s config with your change. Unfortunately, we don’t like to make config changes on behalf of extensions.
- To send a pull request first create a work item (https://aka.ms/portalfx/configtask)
- Then create a new branch from that work item via the ‘create a new branch’ link 
- Make your required changes in the correct files
- Send the PR and include GuruA and SanSom as the reviewers.

Please make this change in all applicable environments, dogfood, PROD, FF, BF, and MC.
The config files follow the naming convention of ‘Extension.*.json’ – where * is the environment.

<a name="using-the-portal-s-arm-token-changes-required"></a>
## Changes required

You need to move the oAuthClientId and oAuthClientCertificate properties to be defined on the non-arm resourceAccess.
See the PR below for an example of these changes. 
https://msazure.visualstudio.com/One/_git/AzureUX-PortalFx/pullrequest/867497?_a=overview


<a name="v2-targets"></a>
# V2 targets

The Azure Portal SDK ships a "V2" targets that is designed to work with CloudBuild. The Azure Portal team and some of the larger extension partners teams have already enabled CloudBuild for their repositories to using the V2 targets. The key value proposition of the V2 targets are:

- Support for compile-on-save of TypeScript files that works with both Visual Studio and VSCode.
- A highly reliable incremental compilation engine that can significantly reduce local development build times.
- Support automatically serving content files that are compressed using max Brotli compression. This feature will help extension performance at the 95th percentile where network latency and throughput dominates.

Below are the steps to switch to the V2 targets. A video of the migration steps can be found here: https://msit.microsoftstream.com/video/49879891-7735-44c0-9255-d32162b78ed5?st=1349

<a name="v2-targets-prerequisites"></a>
## Prerequisites

- Get your extension working with at least Ibiza SDK 5.0.302.6501. The V2 targets are under active development are continuously being improved. Ideally get your extension working with the latest SDK.

<a name="v2-targets-get-your-extension-building-with-tsconfig-json"></a>
## Get your extension building with tsconfig.json

- Fully build your extension to get all of the code-generated files (eg. TypeScript files generated from PDL) generated.
- Delete any generate d.ts files generated in `$(ProjectDir)Client\Definitions`. You do not have to do anything to files outside of the Client folder.
- Add a tsconfig.json to the root of the project with the following content. '''Do not deviate unless you know what you are doing.

```json
  {
    "compileOnSave": true,
    "compilerOptions": {
      "baseUrl": "Client",
      "declaration": true,
      "emitDecoratorMetadata": true,
      "experimentalDecorators": true,
      "forceConsistentCasingInFileNames": true,
      "inlineSources": true,
      "module": "amd",
      "noEmitHelpers": true,
      "noImplicitAny": true,
      "noImplicitThis": true,
      "paths": {
        "*": [
          "*"
        ]
      },
      "outDir": "Output/Content/Scripts",
      "rootDir": "Client",
      "removeComments": false,
      "sourceMap": true,
      "target": "es5"
    },
    "include": [
      "Client/**/*"
    ]
  }
```

- If the framework d.ts files (e.g. MsPortalFx.d.ts) for your extension are in `$(ProjectDir)\Definitions`, the tsconfig.json "include" setting will not include these files. To include these files for compilation, create the file `$(ProjectDir)Client\TypeReferences.d.ts` and add reference tags to these files. You can also include these files by specifying them in the include section of the tsconfig.json.
- Run tsc.exe TypeScript compiler that is shipped with the Portal SDK with the project folder as current directory. This will compile the TypeScript files using the tsconfig.json file.
- You may see new errors because the TypeScript compiler is more strict in checking code when using a tsconfig file. Fix any errors that you see. You may need to remove `/// <reference path="" />` lines from all TypeScript files to fix certain errors.
- If you see a casing mismatch error, you may need to use "git mv" to rename and change the casing of the file.

<a name="v2-targets-get-extension-building-using-v2-targets"></a>
## Get extension building using V2 targets

- Remove all `<TypeScriptCompile>` elements from the csproj. Do not remove the `<SvgTypeScriptCompile>` tags. If you use Visual Studio and want to see TypeScript files in the Solution Explorer, you should instead change the element names to None or Content.
- Remove all TypeScript and PDL MSBuild properties from the csproj. These include:

```xml
  <PropertyGroup>
    <TypeScriptExperimentalDecorators>true</TypeScriptExperimentalDecorators>
    <PortalDefinitionTargetFolder>Client</PortalDefinitionTargetFolder>
    <PortalDefinitionContentName>.</PortalDefinitionContentName>
    <PortalDefinitionWriteAmd>true</PortalDefinitionWriteAmd>
    <EmbeddedTypeScriptResourcePrefixReplace>Client\</EmbeddedTypeScriptResourcePrefixReplace>
    <EmbeddedTypeScriptResourcePrefix>Content\Scripts\</EmbeddedTypeScriptResourcePrefix>
  </PropertyGroup>
  <PropertyGroup Condition="'$(Configuration)' == 'Debug'" Label="TypeScriptConfigurationsDebug">
    <TypeScriptNoImplicitAny>true</TypeScriptNoImplicitAny>
    <TypeScriptTarget>ES5</TypeScriptTarget>
    <TypeScriptRemoveComments>false</TypeScriptRemoveComments>
    <TypeScriptSourceMap>true</TypeScriptSourceMap>
    <TypeScriptGeneratesDeclarations>false</TypeScriptGeneratesDeclarations>
    <TypeScriptModuleKind>AMD</TypeScriptModuleKind>
  </PropertyGroup>
  <PropertyGroup Condition="'$(Configuration)' == 'Release'">
    <TypeScriptNoImplicitAny>true</TypeScriptNoImplicitAny>
    <TypeScriptTarget>ES5</TypeScriptTarget>
    <TypeScriptRemoveComments>true</TypeScriptRemoveComments>
    <TypeScriptSourceMap>true</TypeScriptSourceMap>
    <TypeScriptGeneratesDeclarations>false</TypeScriptGeneratesDeclarations>
    <TypeScriptModuleKind>AMD</TypeScriptModuleKind>
  </PropertyGroup>
```

- Add a content tag for the tsconfig.json file to the .csproj:

```xml
  <Content Include="tsconfig.json" />
```

- Switch the old tools target to the new tools target ("v2") in the .csproj. The new import targets looks something like:

```xml
  <Import Project="$(PkgMicrosoft_Portal_Tools)\build\Microsoft.Portal.Tools.V2.targets" />
```

<a name="v2-targets-enabling-cloudbuild-support"></a>
## Enabling CloudBuild support

- Add the following to the csproj inside an ItemGroup if you have any `<Svg>` tags in the csproj. This tag informs CloudBuild that Svg MsBuild Items are consider inputs to the project.

```xml
  <AvailableItemName Include="Svg">
     <Visible>False</Visible>
  </AvailableItemName>
```

<a name="v2-targets-common-errors"></a>
## Common errors

- Make sure that the `Microsoft.Portal.Tools.V2.targets` is imported after the C# and WebApplication targets. The ordering should look like something before.

```xml
  <Import Project="$(MSBuildToolsPath)\Microsoft.CSharp.targets" />
  <Import Project="$(MSBuildExtensionsPath32)\Microsoft\VisualStudio\v15.0\WebApplications\Microsoft.WebApplication.targets" />
  <Import Project="$(NuGetPath_Microsoft_Portal_Tools)\build\Microsoft.Portal.Tools.V2.targets" Condition="Exists('$(NuGetPath_Microsoft_Portal_Tools)\build\Microsoft.Portal.Tools.V2.targets')" />
```

<a name="v2-targets-breaking-changes-between-v1-and-v2-targets"></a>
## Breaking changes between V1 and V2 targets

- The output location of pde files has been changed from `$(ProjectDir)Client` to `$(OutDir)`.
- The V2 targets uses a different localization model. You should verify that localization is still working by loading the portal with your extension sideloaded and with the query string `?l=fr`.

<a name="dependency-injected-view-models"></a>
# Dependency injected view models

The framework supports loading view models using dependency injection. If you migrate your extension to use this programming model, the SDK will no longer generate ViewModelFactories.ts and a large portion of ExtensionDefinition.ts. Consequently you can remove nearly all code in Program.ts. All of your DataContext classes will also be bundled with the associated blade and will no longer be loaded up front.

> If you have any issues throughout this process please post to our [stack overflow](https://aka.ms/portalfx/ask)

<a name="dependency-injected-view-models-prerequistes"></a>
## Prerequistes

- Migrate to V2 targets if you haven’t done so (See: [V2 targets](#v2-targets))
- Upgrade to at least SDK 5.0.302.3001+
- Cleanup your extension project TypeScript code and remove all uses of export = Main.
  - Check this PR in the portal repo for an example: https://msazure.visualstudio.com/One/_git/AzureUX-PortalFx/pullrequest/1003495?_a=overview
  - You do not have to remove trailing newlines like the PR.
- Commit and verify that these changes do not break your extension before starting the actual migration.

<a name="dependency-injected-view-models-migration-steps"></a>
## Migration steps

- Ensure that the emitDecoratorMetadata compiler option is set to true in the tsconfig.json
- Delete the generated ViewModelFactories.ts from `Client\_generated`
- Add the following line to your csproj

```xml
<EnableDependencyInjectedViewModels>true</EnableDependencyInjectedViewModels>
```

- Build the extension project
- Get a copy of the dependency injection migration tool at: [\\\\wimoy-dev\Public\DependencyInjectionMigrator](\\\\wimoy-dev\Public\DependencyInjectionMigrator) and copy it locally.
  - Look for the string "ViewModels:" in the build logs and copy and paste the JSON to Extension.json in the dependency injection migration tool.
  - Modify the migration tool source code and put in the path of the folder that contains the TypeScript for your extension
- Run the tool and migrate your V1 view models.
  - The tool will modify your source files and perform the following operations:
    - Add `import * as Di from "Fx/DependencyInjection` to the top of any file with a V1 (pdl) view model
    - Add `@Di.Class("viewModel")` right before every single V1 view model class
    - Delete the initialState second parameter of the viewModel classes
  - The migration tool is based on regex and is not perfect. Review the results and make any necessary adjustments to ensure that it performs those three operations on all V1 viewModels.
  - The removal of the initialState parameter may cause breaks in your code if your code was referencing the parameter. The portal was always passing null for initialState. You can basically remove all uses of initialState.
  - If the tool outputs anything besides a completion message, send wimoy an email with the message
- Optionally, remove any parameters in V1 view models that are no longer needed. In the process of doing so, you may end up with some unused DataContext classes too. You can remove them if they are not used by V2 (no-pdl) view models.
- Find all V2 view models and add the InjectableModel decorator. Refer to the PRs below for examples.
  - You can enumerate all of the V2 view models by going through the code in the following generated folders located at the root of your TypeScript build:
    - _generated\adapters\blade
    - _generated\adapters\part
  - DataContext classes referenced by V2 view models cannot be removed even if they are empty
  - If you forget to do this step for a V2 view model, you will see an error similar to: `The InjectableModel.Decorator decorator is missing. Please add the appropriate InjectableModel.Decorator decorator to your 'SubscriptionPropertiesBladePinnedPart' view model.`
- Find all DataContext classes that are still referenced by your view models and add the `@Di.Class()` decorator.
  - Note that `@Di.Class()` is called with no arguments.
  - You will need to add `import * as Di from "Fx/DependencyInjection` to the top of the files
  - The migration validation script in one of the steps below can help you track down all of the DataContext classes that need to be annotated.
- Remove the code in Program.ts that initializes the DataContext classes. Set the generic type parameter of `MsPortalFx.Extension.EntryPointBase` base class specification to void.
- The constructor of any class that contains a `@Di.Class()` decorator (with or without the "viewModel" argument) cannot contain an parameter that is specified with a non-class type. Some of your view model classes may have a dataContext or container parameter with an any type or an interface type. Either change the type to a class or remove the parameter entirely.
  - When this rule is violated, you will see errors like `Cannot compose 'Object' because it is not correctly decorated`.
- All classes in the dependency chain of migrated view models should be marked with `@Di.Class()` decorator. The dependency injection framework in the Portal only supports constructor injection.
- Put the following code in your Program.ts right at the module level. Then load your extension through the portal. This load all of your view models and validate that you have correctly migrated the V1 view models. Remove the code when you are done.

```typescript
MsPortalFx.require("Fx/DependencyInjection")
    .then((di: any) => {
        const container: any = di.createContainer("viewModel");
        (function (array: any[]) {
            array.forEach(a => {
                if (a.module) {
                    MsPortalFx.require(a.module)
                        .then((m: any) => {
                            console.log("Loading view model: " + a.module + " " + a.export);
                            const exportedType = m[a.export];
                            if (exportedType.ViewModelAdapter) {
                                // Can't validate V2 view models
                            }
                            else {
                                container._validate(new (<any>window).Map(), exportedType);
                            }
                        });
                }
            });
        })([/* insert view model json from build log here */ ]);
});
```

- Temporarily set `emitDecoratorMetadata` compiler option to false. Then turn on the compiler option `noUnusedParameters` and `noUnusedLocals`. Remove any dead parameters flagged by the compiler. You may find some violations in generated code. Ignore them.

<a name="dependency-injected-view-models-pull-request-samples"></a>
## Pull Request Samples

- https://msazure.visualstudio.com/One/_git/AzureUX-PortalFx/pullrequest/1013125
- https://msazure.visualstudio.com/One/_git/AzureUX-PortalFx/pullrequest/1013301
- https://msazure.visualstudio.com/One/_git/AzureUX-PortalFx/pullrequest/1016472
- https://msazure.visualstudio.com/One/_git/AD-IAM-IPC/pullrequest/1096247
- https://msazure.visualstudio.com/One/_git/AD-IAM-Services-ADIbizaUX/pullrequest/1098977
- https://msazure.visualstudio.com/One/_git/MGMT-AppInsights-InsightsPortal/pullrequest/1124038
- https://msazure.visualstudio.com/One/_git/AzureUX-IaaSExp/pullrequest/1176274
- https://msazure.visualstudio.com/One/_git/AzureUX-IaaSExp/pullrequest/1159718

<a name="performance-profiling"></a>
# Performance profiling

<a name="performance-profiling-how-to-profile-your-scenario"></a>
## How to profile your scenario

1. Open a browser and load portal using `https://portal.azure.com/?clientoptimizations=bundle&feature.nativeperf=true​`
    - `clientOptimizations=bundle` will allow you to assess which bundles are being downloaded in a user friendly manner
    - `feature.nativeperf=true` will expose native performance markers within your profile traces, allowing you to accurately match portal telemetry markers to the profile
1. Go to a blank dashboard​
1. Clear cache (hard reset), remove all application data and reload the portal​
1. Use the browsers profiling timeline to throttle both network and CPU, this best reflects the 95th percentile scenario, then start the profiler
1. Walk through your desired scenario
    - Switch to the desired dashboard
    - Deep link to your blade, make sure to keep the feature flags in the deep link. Deeplinking will isolate as much noise as possible from your profile
1. Stop the profiler
1. Assess the profile

<a name="performance-profiling-identifying-common-slowdowns"></a>
## Identifying common slowdowns

1. Blocking network calls
    - Fetching data - We've seen often that backend services don't have the same performance requirements as the front end experience, because of which you may need to engage your backend team/service to ensure your front end experience can meet the desired performance bar. 
    - Required files - Downloading more than what is required, try to minimise your total payload size. 
1. Heavy rendering and CPU from overuse of UI-bound observables
    - Are you updating the same observable repeatedly in a short time frame? Is that reflected in the DOM in any way? Do you have computeds listening to a large number of observables?

<a name="performance-profiling-verifying-a-change"></a>
## Verifying a change

To correctly verify a change you will need to ensure the before and after are instrumented correctly with telemetry. Without that you cannot truly verify the change was helpful.
We have often seen what seems like a huge win locally transition into a smaller win once it's in production, we've also seen the opposite occur too.
The main take away is to trust your telemetry and not profiling, production data is the truth. 

[TelemetryOnboarding]: <portalfx-telemetry-getting-started.md>
[Ext-Perf/Rel-Report]: <http://aka.ms/portalfx/dashboard/extensionperf>
