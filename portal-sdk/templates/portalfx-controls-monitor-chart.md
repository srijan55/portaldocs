## Monitor Chart
> **Important:** The Monitor Chart control is currently in preview and is under active development. Unless your Extension's scenario has already been discussed with the Portal team, this control should only be used for prototyping.

The Monitor Chart control allows you to plot the metrics for your resource in Azure. It is part of the Ibiza framework, and it inherently knows how to fetch data for your resource.

The Monitor Chart control is available in SDK version **5.0.302.718** and above.

### Benefits
- **Performance** - The charts are built to render quickly and make efficient network calls for data
- **First class integration with Azure Monitor** - When you click on a chart, it will take you to the metrics experience in Azure Monitor
- **Automatic responsive behavior** - You can pass in an array of charts to display and the control takes care of css responsiveness

### Pre-requisites: Onboard to Monitor config
If you are onboarding to Azure Monitor for the first time, please reach out to the [Monitoring team](mailto:ibizamon@microsoft.com). 

The Monitoring team will add your resource type to a config which allows the Monitor Control to know how to fetch metrics for your resources.

<a name="controlUsage"></a>
### Using the control
```typescript
import * as MonitorChart from "Fx/Internal/Controls/MonitorChart";

...

// Create the MonitorChart options
const timespan: MonitorChart.Timespan = {
    relative: {
        durationMs: 1 * 60 * 60 * 1000 // 1 hour
    }
};
const chartDefinition: MonitorChart.ChartDefinition = {
    metrics: [
        {
            name: "testMetric1",
            resourceMetadata: { resourceId: "test/resource/id" }
        }
    ]
};
const monitorChartOptions: MonitorChart.Options = {
    charts: [ chartDefinition ],
    timespan: timespan
};

// Create the MonitorChart viewmodel
const monitorChartViewModel = MonitorChart.create(bladeOrPartContainer, monitorChartOptions);
```

> You can plot more than one chart while referencing the control. Also, you can plot multiple metrics for each chart.

> To see a complete list of the options you can pass to the control, look at the `Fx/Internal/Controls/MonitorChart` module in Fx.d.ts, or you can [view the interfaces directly in the PortalFx repo][6].

<a name="legacyBladeUsage"></a>
### [ LEGACY BLADES ] Using the control on a locked/unlocked blade
If you are not using a template blade, you can reference the `MonitorChartPart` from the `HubsExtension` in your blade's pdl.

> Ensure that you have the HubsExtension.pde added to your extension

**Example Blade PDL:**
```xml
<?xml version="1.0" encoding="utf-8" ?>
<Definition xmlns="http://schemas.microsoft.com/aux/2013/pdl"
            xmlns:azurefx="http://schemas.microsoft.com/aux/2013/pdl/azurefx"
            Area="ExampleArea">
 
  <Blade Name="ExampleBlade"
         ViewModel="{ViewModel Name=ExampleViewModel}"
         Width="Large"
         Locked="True">
    <Lens Name="MonitorChartLens">

      <!-- MonitorChartPart reference: -->
      <PartReference Name="MonitorChart" Extension="HubsExtension" PartType="MonitorChartPart" InitialSize="HeroWide">
        <PartReference.PropertyBindings>
          <Binding Property="options">
            <BladeProperty Property="monitorChartPartInputs" />
          </Binding>
        </PartReference.PropertyBindings>
      </PartReference>

    </Lens>
  </Blade>
</Definition>
```
**Example Blade view model:**
```typescript
export class MonitorChartBladeViewModel extends FxViewModels.Blade {
    public monitorChartPartInputs = ko.observable<MonitorChartPartParameters>();

    constructor(container: FxViewModels.ContainerContract) {
        super();
       
        this.monitorChartPartInputs({
            chartDefinitions: [{
                metrics: [{
                    name: "ActionLatency",
                    resourceMetadata: {
                        resourceId: "/subscriptions/0531c8c8-df32-4254-a717-b6e983273e5f/resourceGroups/ibizafeedback/providers/Microsoft.Logic/workflows/Ibiza-CleanUnusedTags"
                    },
                    aggregationType: 1
                }]
            }],
            timespan: {
                relative: {
                    durationMs: 1000000000
                }
            }
        });
    }
}
```

> To see a complete list of the options you can pass to the MonitorChartPart, look at the `MonitorChartPartExportedTypes.d.ts` file either in the Hubs Nuget package, or [directly in the Hubs repo][7].

### Try it out in samples extension
You can try out the monitor chart control in the [Samples Extension][1], or view the code directly in the Samples Extension at:

`\Client\V2\Preview\MonitorChart\MonitorChartBlade.ts`

To plot a single chart with "dummy data", try the following input for `Chart Input JSON`:
```json
[
    {
        "title": "CPU usage",
        "subtitle": "For VM1 in last 24 hours",
        "chartType": 0,
        "metrics": [
            {
                "resourceMetadata": {
                    "resourceId": "/subscriptions/f2ba4a4e-f3e7-d17d-beee-a2048b203427/resourceGroups/TestRG/providers/Dummy.Provider/dummyresource/TestResource"
                },
                "name": "DummyMetric1"
            }
        ]
    }
]
```
![Metrics chart control single input][2]

To plot multiple charts with "dummy data", try the following input for `Chart Input JSON`:
```json
[
    {
        "title": "CPU usage",
        "subtitle": "For VM1 in last 24 hours",
        "chartType": 1,
        "metrics": [
            {
                "resourceMetadata": {
                    "resourceId": "/subscriptions/f2ba4a4e-f3e7-d17d-beee-a2048b203427/resourceGroups/TestRG/providers/Dummy.Provider/dummyresource/TestResource"
                },
                "name": "DummyMetric1"
            }
        ]
    },
    {
        "title": "Memory usage",
        "subtitle": "For VM1 in last 24 hours",
        "chartType": 1,
        "metrics": [
            {
                "resourceMetadata": {
                    "resourceId": "/subscriptions/f2ba4a4e-f3e7-d17d-beee-a2048b203427/resourceGroups/TestRG/providers/Dummy.Provider/dummyresource/TestResource"
                },
                "name": "DummyMetric1"
            }
        ]
    },
    {
        "title": "Network usage",
        "subtitle": "For VM1 in last 24 hours",
        "chartType": 0,
        "metrics": [
            {
                "resourceMetadata": {
                    "resourceId": "/subscriptions/f2ba4a4e-f3e7-d17d-beee-a2048b203427/resourceGroups/TestRG/providers/Dummy.Provider/dummyresource/TestResource"
                },
                "name": "DummyMetric1"
            }
        ]
    },
    {
        "title": "Disk usage",
        "subtitle": "For VM1 in last 24 hours",
        "chartType": 0,
        "metrics": [
            {
                "resourceMetadata": {
                    "resourceId": "/subscriptions/f2ba4a4e-f3e7-d17d-beee-a2048b203427/resourceGroups/TestRG/providers/Dummy.Provider/dummyresource/TestResource"
                },
                "name": "DummyMetric1"
            }
        ]
    },
    {
        "title": "Other",
        "subtitle": "For VM1 in last 24 hours",
        "chartType": 1,
        "metrics": [
            {
                "resourceMetadata": {
                    "resourceId": "/subscriptions/f2ba4a4e-f3e7-d17d-beee-a2048b203427/resourceGroups/TestRG/providers/Dummy.Provider/dummyresource/TestResource"
                },
                "name": "DummyMetric1"
            }
        ]
    }
]
```
![Metrics chart control multiple inputs][3]

### End-to-end flow for users

#### Overview blade
Once you reference the monitor chart control in your overview blade, it will look similar to the following screenshot:

![Monitor chart control overview blade][4]

#### Integration with Azure Monitor

When a user clicks one of the charts, it will load the Azure Monitor metrics blade:

![Monitor chart control azure monitor][5]

From here, users can explore other metrics, pin charts to dashboard, create an alert or set the export options via diagnostics settings.

### FAQs

- ***My extension is still using legacy blades (locked or unlocked). Is this still applicable to me? If yes, do I get the benefits mentioned above?***

    Yes, even if you are not using template blades you can [reference the MonitorChartPart](#legacyBladeUsage) from the Hubs extension. 
    
    If you already have an Insights/Monitoring Metrics part on your blade, instead of referencing the metrics part from Insights/Monitoring extension, you can reference the part from Hubs extension. Since the Hubs extension is always loaded when you load the portal, it will already be loaded by the time user loads your extension blade. Hence, you will not load an additional extension and get significant perf benefits. 
    
    However, for the best performance, we strongly recommend that you move towards template blades and [consume the MonitorChart control](#controlUsage) directly.

- ***Can the users change the metrics/time range/chart type of the charts shown in the overview blade?***

    No, users cannot customize what is shown in the overview blade. For any customizations, users can click on the chart, go to Azure Monitor, tweak the chart if needed and then pin to the dashboard. The dashboard will contain all the charts that users want to customize and view. 
    
    This keeps our story consistent: view the metrics in overview blade, explore them in Azure Monitor and track/monitor them in Azure Dashboard. Removing customizations from blades also provides more reliable blade performance.

<!-- References -->
[1]: https://df.onecloud.azure-test.net/#blade/SamplesExtension/SDKMenuBlade/monitorchart
[2]: ../media/portalfx-controls-monitor-chart/monitor-chart-control-single-input.png
[3]: ../media/portalfx-controls-monitor-chart/monitor-chart-control-multiple-inputs.png
[4]: ../media/portalfx-controls-monitor-chart/monitor-chart-control-overview-blade.png
[5]: ../media/portalfx-controls-monitor-chart/monitor-chart-control-azure-monitor.png
[6]: https://msazure.visualstudio.com/DefaultCollection/One/_git/AzureUX-PortalFX?path=%2Fsrc%2FSDK%2FFramework.Client%2FTypeScript%2FFx%2FInternal%2FControls%2FMonitorChart.ts&version=GBproduction&_a=contents
[7]: https://msazure.visualstudio.com/DefaultCollection/One/_git/AzureUX-PortalFX?path=%2Fsrc%2FSDK%2FExtensions%2FHubsExtension%2FTypeScript%2FHubsExtension%2FForExport%2FMonitorChartPartExportedTypes.d.ts&version=GBproduction&_a=contents