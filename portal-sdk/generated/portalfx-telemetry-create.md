﻿* [Create Telemetry](#create-telemetry)
    * [Create Flow Telemetry Dashboards](#create-telemetry-create-flow-telemetry-dashboards)
    * [Create Flow table](#create-telemetry-create-flow-table)
    * [Create Flow Functions](#create-telemetry-create-flow-functions)
        * [GetCreateFlows](#create-telemetry-create-flow-functions-getcreateflows)
        * [GetCreateFunnel](#create-telemetry-create-flow-functions-getcreatefunnel)
        * [GetCreateFunnelByDay](#create-telemetry-create-flow-functions-getcreatefunnelbyday)
        * [GetCombinedCreateFunnel](#create-telemetry-create-flow-functions-getcombinedcreatefunnel)
* [<a name="FAQ"></a>FAQ](#a-name-faq-a-faq)
    * [I want to query for a large time frame (+14d) but I'm getting the error, `‘accumulated string too large’`](#a-name-faq-a-faq-i-want-to-query-for-a-large-time-frame-14d-but-i-m-getting-the-error-accumulated-string-too-large)
    * [I'm getting the error, `Request execution has timed-out on the service side and was aborted.`](#a-name-faq-a-faq-i-m-getting-the-error-request-execution-has-timed-out-on-the-service-side-and-was-aborted)


<a name="create-telemetry"></a>
# Create Telemetry

<a name="create-telemetry-create-flow-telemetry-dashboards"></a>
## Create Flow Telemetry Dashboards

* PowerBi Dashboard: [https://msit.powerbi.com/groups/me/dashboards/73368590-6a29-4a85-b534-69791580be4a](https://msit.powerbi.com/groups/me/dashboards/73368590-6a29-4a85-b534-69791580be4a)
* [Documentation](portalfx-telemetry-createFlowDashboard.md)
  
<a name="create-telemetry-create-flow-table"></a>
## Create Flow table

CreateFlow table in Kusto database **AzPtlCosmos** called **CreateFlows**

Accessible through using the function: **GetCreateFlows(startDate: datetime, endDate: datetime)**

[Note] The AzPtlCosmos database **does not** contain test traffic or unnofficial creates which don't go through the Marketplace or +New.

For questions or issues, check out the [FAQ](#FAQ)

<a name="create-telemetry-create-flow-functions"></a>
## Create Flow Functions

<a name="create-telemetry-create-flow-functions-getcreateflows"></a>
### GetCreateFlows

<a name="create-telemetry-create-flow-functions-getcreateflows-summary"></a>
#### Summary
`GetCreateFlows(startDate: datetime, endDate: datetime)`

This function returns the list of Portal Azure service deployment lifecycles, also known as 'create flows', for a given time range.
* Each create flow represents the lifecycle of a create with the beginning being marked by the moment the create blade is opened and ending the moment that the create has been concluded and logged by the Portal.
* Data for each create is curated and joined between Portal data logs and available ARM deployment data logs.

<a name="create-telemetry-create-flow-functions-getcreateflows-common-use-cases"></a>
#### Common Use Cases
* Identifying the number of creates completed for a given Extension or for a particular Azure marketplace gallery package.
* Calculating the percentage of successful creates initiated by an Extension's create blade.
* Debugging failed deployments by retrieving error message information logged for failed creates.
* Calculating the number of creates that were abandoned by the user before being initiated and completed.
* Identifying creates initiated by a given user id.
* Calculating the average create duration by data center.

<a name="create-telemetry-create-flow-functions-getcreateflows-underlying-function-resources"></a>
#### Underlying Function Resources
* `cluster("Azportalpartner").database("AzPtlCosmos").CreateFlows`
  * The source of the Azure create lifecycle deployment information.
* `cluster("Armprod").database("ARMProd").Deployments`
  * The source of the ARM deployment information
* `cluster("Armprod").database("ARMProd").HttpIncomingRequests`
  * Used to identify which of the ARM deployments are requests made from the Portal.
* `cluster("Armprod").database("ARMProd").EventServiceEntries`
  * The source of the ARM deployment failed logs error information.

<a name="create-telemetry-create-flow-functions-getcreateflows-parameters"></a>
#### Parameters
* startDate: The date to mark the inclusive start of the time range.
* endDate: The date to mark the exclusive end of the time range.

<a name="create-telemetry-create-flow-functions-getcreateflows-output-columns"></a>
#### Output Columns
* PreciseTimeStamp
  * Time of which the create blade was opened
  * When the create flow launched event is logged by the server
* TelemetryId
  * The unique identifier of this Azure Portal create flow.
* Extension
  * The extension which initiated the deployment.
* Blade
  * The name of the blade which was used to initiated the deployment.
* GalleryPackageId
  * The Azure service market place gallery package that was created.
* ExecutionStatus
  * The final result of the create execution.
  * Possible execution statuses
    * Succeeded
      * The create was successfully completed.
      * If ARMExecutionStatus is *"Succeeded"* or if ARMExecutionStatus is blank and PortalExecutionStatus is *"Succeeded"*
    * Canceled
      * The create was canceled before completion
      * If ARMExecutionStatus is *"Canceled"* or if ARMExecutionStatus is blank and PortalExecutionStatus is *"Canceled"*
    * Failed
      * The create failed to complete.
      * If ARMExecutionStatus is *"Failed"* or if ARMExecutionStatus is blank and PortalExecutionStatus is *"Failed"*
    * CommerceError
      * The create was rejected because of a billing or commerce related error such as, *"We could not find a credit card on file for your azure subscription. Please make sure your azure subscription has a credit card."
    * Unknown
      * The status of the create is unable to be determined.
      * If ARMExecutionStatus is blank and PortalExecutionStatus is blank
    * Abandoned 
      * The create blade was closed before a create was initialized.
* Excluded
  * Boolean which represents if this Create Flow is to be excluded from create funnel KPI calculations.
  * A Create Flow is marked `Excluded == true` 
    * if ExecutionStatus is *"Canceled"*, *"CommerceError"*, or *"Unknown"*.
    * if `OldCreateApi == true`
    * if Hubs Extension Custom Template create
* CorrelationId
  * The unique ARM identifier of this deployment.
* ArmDeploymentName
  * The name of the resource group deployment from ARM.
* ArmExecutionStatus
  * The result of the deployment from ARM.
* PortalExecutionStatus
  * The result of the deployment execution logged by the Portal.
* ArmStatusCode
  * The ARM status code of the deployment .
* ArmErrorCode
  * The error code of a failed deployment logged by ARM.
* ArmErrorMessage
  * The error message of a failed deployment logged by ARM.
* PortalErrorCode
  * The error code of a failed deployment logged by the Portal.
* PortalErrorMessage
  * The error message of a failed deployment logged by the Portal.
* CreateBladeOpened
  * Boolean representing if the create blade was opened.
  * Logged as a CreateFlowLaunched event at the time that the create blade is opened and logged by the Portal.
* CreateBladeOpenedStatus
  * Context for CreateBladeOpened.
* CreateBladeOpenedTime
  * Time when the create blade was opened.
* PortalCreateButtonClicked
  * Boolean representing if a Portal create was started for this create flow.
  * Logged by a ProvisioningStarted event when the create is initiated.
* PortalCreateButtonClickedStatus
  * Context for PortalCreateStarted.
* PortalCreateButtonClickedTime
  * Time when the Portal create was started and logged by the Portal.
* PortalDeploymentAcceptedByArm
  * Boolean representing if a deployment request was accepted by ARM.
  * Logged when the deployment request is acknowledged by ARM and a CreateDeploymentStart event was logged by the Portal.
* PortalDeploymentAcceptedByArmStatus
  * Context for the ArmDeploymentStarted.
* PortalDeploymentAcceptedByArmTime
  * The time when the ARM deployment request response was logged by the Portal.
* PortalDeploymentCompletedByArm
  * Boolean representing if a deployment was completed by ARM.
  * Logged when ARM has completed status for the deployment and a CreateDeploymentEnd event was logged by the Portal.
* PortalDeploymentCompletedByArmStatus
  * Context for ArmDeploymentEnded.
* PortalDeploymentCompletedByArmTime
  * The time when the CreateDeploymetEnd event was logged.
* PortalCreateEnded
  * Boolean representing if a Portal create was completed for this create flow.
  * Logged when all operations relating to the create have completed and a ProvisioningEnded event was logged by the Portal.
* PortalCreateEndedStatus
  * Context for PortalCreateEnded.
* PortalCreateEndedTime
  * Time when the Portal create was completed and logged by the Portal.
* PortalCreateDuration
  * Duration of the Portal create.
  * PortalCreateDuration = PortalCreateEndTime - PortalCreateStartTime
* ArmPreciseStartedTime
  * Start time of the deployment through ARM
* ArmPreciseEndedTime
  * End time of the deployment through ARM.
* ArmPreciseDuration
  * Duration of the deployment through ARM.
* Data
  * The entire collection of logged create events' telemetry data in JSON format.
* BuildNumber
  * The Portal SDK and environment in which the deployment was initiated.
* DataCenterId
  * The data center in which the deployment telemetry originated.
* SessionId
  * The session in which the deployment was initiated.
* UserId
  * The user identification which initiated the deployment.
* ObjectId
  * The AAD object Id
* SubscriptionId
  * The subscription Id
* TenantId
  * The tenant Id
* OldCreateApi
  * Boolean representing if the deployment was initiated using the latest supported Provisioning API.
* CustomDeployment
  * Boolean representing if the deployment was initiated using the Portal ARM Provisioning Manager.

<a name="create-telemetry-create-flow-functions-getcreatefunnel"></a>
### GetCreateFunnel

<a name="create-telemetry-create-flow-functions-getcreatefunnel-summary"></a>
#### Summary
`GetCreateFunnel(startDate: datetime, endDate: datetime)`

This functions calculates the create funnel KPI's for each extension's create blade for a given time range.

<a name="create-telemetry-create-flow-functions-getcreatefunnel-common-use-cases"></a>
#### Common Use Cases
* Retrieving the percentage of successful create initated by an Extension's create blade for a week.
* Retrieving the number of the failed creates.
* Retrieving the drop off rate of customers attempting a create (how often creates are abandoned).

<a name="create-telemetry-create-flow-functions-getcreatefunnel-underlying-function-resources"></a>
#### Underlying Function Resources
* [GetCreateFlows()](#create-telemetry-create-flow-functions-getcreateflows)

<a name="create-telemetry-create-flow-functions-getcreatefunnel-parameters"></a>
#### Parameters
* startDate: The date to mark the inclusive start of the time range.
* endDate: The date to mark the exclusive end of the time range.

<a name="create-telemetry-create-flow-functions-getcreatefunnel-output-columns"></a>
#### Output Columns
* Extension
  * The Extension which initiated the creates.
* Blade
  * The create blade which inititated the creates.
* CreateBladeOpened
  * The number of times the create blade was opened.
  * Calculated by taking the count of the number of Create Flows for each blade from [GetCreateFlows()](#create-telemetry-create-flow-functions-getcreateflows) which had:
    * `CreateBladeOpened == true`.
* Started
  * The number of creates that were started.
  * Calculated by taking the count of the number of Create Flows for each blade from [GetCreateFlows()](#create-telemetry-create-flow-functions-getcreateflows) which had:
    * `PortalCreateStarted == true`
    * or `ArmDeploymentStarted == true`
  * *Note - We check both of these for redundancy proof becuase we know that as long as one of these properties are true then we know a create was started.*
* Excluded
  * The number of creates from [GetCreateFlows()](#create-telemetry-create-flow-functions-getcreateflows) that were marked as Excluded.
  * *See [GetCreateFlows()](#create-telemetry-create-flow-functions-getcreateflows) documentation for Excluded details.*
* Completed
  * The number of creates that *started* and were not *excluded*, therefore resulting in a completed state we care about.
  * Calculated by creates which had:
    * `ExecutionStatus != "Abandonded" and Excluded == false`
* StartRate
  * The rate of create blades that are opened which leads to a create being started.
  * StartRate = Started / CreateBladeOpened
* Succeeded
  * The number of creates that succeeded.
* SuccessRate
  * The rate of completed creates which succeeded.
  * SuccessRate = Succeeded / Completed
* Failed
  * The number of creates that failed.
* FailureRate
  * The rate of completed creates which failed.
  * FailureRate = Failed / Completed
* Canceled
  * The number of creates which were canceled.
* CommerceError
  * The number of creates which were aborted due to a commerce error.
* Unknown
  * The number of creates which do not have a known result.
* OldCreateApi
  * Represents if the create blade deployments were initiated using a deprecated version of the ARM provisioning API provided by the Portal SDK
* CustomDeployment
  * Represents if the create blade deployments were initiated without using the official ARM provisioning API provided by the portal SDK

<a name="create-telemetry-create-flow-functions-getcreatefunnelbyday"></a>
### GetCreateFunnelByDay

<a name="create-telemetry-create-flow-functions-getcreatefunnelbyday-summary"></a>
#### Summary
`GetCreateFunnelByDay(startDate: datetime, endDate: datetime)`

This functions calculates the create funnel KPI's for each extension's create blade for each day over a given time range.

<a name="create-telemetry-create-flow-functions-getcreatefunnelbyday-common-use-cases"></a>
#### Common Use Cases
* Identifying the change in the number of successful create initiated by an Extension's create blade over the course of multiple weeks.
* Identifying which days have higher number of failed deployments.

<a name="create-telemetry-create-flow-functions-getcreatefunnelbyday-underlying-function-resources"></a>
#### Underlying Function Resources
* [GetCreateFlows()](#create-telemetry-create-flow-functions-getcreateflows)

<a name="create-telemetry-create-flow-functions-getcreatefunnelbyday-parameters"></a>
#### Parameters
* startDate: The date to mark the inclusive start of the time range.
* endDate: The date to mark the exclusive end of the time range.

<a name="create-telemetry-create-flow-functions-getcreatefunnelbyday-output-columns"></a>
#### Output Columns
* Date
  * The date at midnight of the day which the create flow was started.
* Extension
  * The Extension which initiated the creates.
* Blade
  * The create blade which inititated the creates.
* GalleryPackageId
  * The gallery package id that was created.
* CreateBladeOpened
  * The number of times the create blade was opened.
  * Calculated by taking the count of the number of Create Flows  for each blade from [GetCreateFlows()](#create-telemetry-create-flow-functions-getcreateflows) which had:
    * `CreateBladeOpened == true`.
* Started
  * The number of creates that were started.
  * Calculated by taking the count of the number of Create Flows  for each blade from [GetCreateFlows()](#create-telemetry-create-flow-functions-getcreateflows) which had:
    * `PortalCreateStarted == true`
    * or `ArmDeploymentStarted == true`
  * *Note - We check both of these for redundancy proof becuase we know that as long as one of these properties are true then we know a create was started.*
* Excluded
  * The number of creates from [GetCreateFlows()](#create-telemetry-create-flow-functions-getcreateflows) that were marked as Excluded.
  * *See [GetCreateFlows()](#create-telemetry-create-flow-functions-getcreateflows) documentation for Excluded details.*
* Completed
  * The number of creates that were completed.
  * Completed = Started - Excluded
* StartRate
  * The rate of create blades that are opened which leads to a create being started.
  * StartRate = Started / CreateBladeOpened
* Succeeded
  * The number of creates that succeeded.
* SuccessRate
  * The rate of completed creates which succeeded.
  * SuccessRate = Succeeded / Completed
* Failed
  * The number of creates that failed.
* FailureRate
  * The rate of completed creates which failed.
  * FailureRate = Failed / Completed
* Canceled
  * The number of creates which were canceled.
* CommerceError
  * The number of creates which were aborted due to a commerce error.
* Unknown
  * The number of creates which do not have a known result.
* OldCreateApi
  * Represents if the create blade deployments were initiated using a deprecated version of the ARM provisioning API provided by the Portal SDK
* CustomDeployment
  * Represents if the create blade deployments were initiated without using the official ARM provisioning API provided by the portal SDK

<a name="create-telemetry-create-flow-functions-getcreatefunnelbyday-getcreatefunnelbygallerypackageid"></a>
#### GetCreateFunnelByGalleryPackageId

<a name="create-telemetry-create-flow-functions-getcreatefunnelbyday-summary"></a>
#### Summary
`GetCreateFunnelByGalleryPackageId(startDate: datetime, endDate: datetime)`

This functions calculates the create funnel KPI's by gallery package id, extension, and create blade over a given time range.

<a name="create-telemetry-create-flow-functions-getcreatefunnelbyday-common-use-cases"></a>
#### Common Use Cases
* Identifying the number of successfully creates for a resource.
* Identifying which resources have higher number of failed deployments.

<a name="create-telemetry-create-flow-functions-getcreatefunnelbyday-underlying-function-resources"></a>
#### Underlying Function Resources
* [GetCreateFlows()](#create-telemetry-create-flow-functions-getcreateflows)

<a name="create-telemetry-create-flow-functions-getcreatefunnelbyday-parameters"></a>
#### Parameters
* startDate: The date to mark the inclusive start of the time range.
* endDate: The date to mark the exclusive end of the time range.

<a name="create-telemetry-create-flow-functions-getcreatefunnelbyday-output-columns"></a>
#### Output Columns
* Extension
  * The Extension which initiated the creates.
* Blade
  * The create blade which inititated the creates.
* GalleryPackageId
  * The gallery package id that was created.
* CreateBladeOpened
  * The number of times the create blade was opened.
  * Calculated by taking the count of the number of Create Flows for each blade from [GetCreateFlows()](#create-telemetry-create-flow-functions-getcreateflows) which had:
    * `CreateBladeOpened == true`.
* Started
  * The number of creates that were started.
  * Calculated by taking the count of the number of Create Flows for each blade  from [GetCreateFlows()](#create-telemetry-create-flow-functions-getcreateflows) which had:
    * `PortalCreateStarted == true`
    * or `ArmDeploymentStarted == true`
  * *Note - We check both of these for redundancy proof becuase we know that as long as one of these properties are true then we know a create was started.*
* Excluded
  * The number of creates from [GetCreateFlows()](#create-telemetry-create-flow-functions-getcreateflows) that were marked as Excluded.
  * *See [GetCreateFlows()](#create-telemetry-create-flow-functions-getcreateflows) documentation for Excluded details.*
* Completed
  * The number of creates that were completed.
  * Completed = Started - Excluded
* StartRate
  * The rate of create blades that are opened which leads to a create being started.
  * StartRate = Started / CreateBladeOpened
* Succeeded
  * The number of creates that succeeded.
* SuccessRate
  * The rate of completed creates which succeeded.
  * SuccessRate = Succeeded / Completed
* Failed
  * The number of creates that failed.
* FailureRate
  * The rate of completed creates which failed.
  * FailureRate = Failed / Completed
* Canceled
  * The number of creates which were canceled.
* CommerceError
  * The number of creates which were aborted due to a commerce error.
* Unknown
  * The number of creates which do not have a known result.
* OldCreateApi
  * Represents if the create blade deployments were initiated using a deprecated version of the ARM provisioning API provided by the Portal SDK
* CustomDeployment
  * Represents if the create blade deployments were initiated without using the official ARM provisioning API provided by the portal SDK

<a name="create-telemetry-create-flow-functions-getcombinedcreatefunnel"></a>
### GetCombinedCreateFunnel

<a name="create-telemetry-create-flow-functions-getcombinedcreatefunnel-summary"></a>
#### Summary
`GetCombinedCreateFunnel(startDate: datetime, endDate: datetime)`

This functions calculates the overall create funnel KPIs for the Portal.

<a name="create-telemetry-create-flow-functions-getcombinedcreatefunnel-common-use-cases"></a>
#### Common Use Cases
* Identifying the overall success rates of creates in the Portal.
* Identifying the total number of failed creates in the Portal.
* Identifying the total number of create aborted due to commerce errors in the Portal.
* Identifying the overall rate of create flows that lead to a create being started.

<a name="create-telemetry-create-flow-functions-getcombinedcreatefunnel-underlying-function-resources"></a>
#### Underlying Function Resources
* [GetCreateFlows()](#create-telemetry-create-flow-functions-getcreateflows)

<a name="create-telemetry-create-flow-functions-getcombinedcreatefunnel-parameters"></a>
#### Parameters
* startDate: The date to mark the inclusive start of the time range.
* endDate: The date to mark the exclusive end of the time range.

<a name="create-telemetry-create-flow-functions-getcombinedcreatefunnel-output-columns"></a>
#### Output Columns
* CreateBladeOpened
  * The total number of times create blade were opened.
  * Calculated by taking the total count of the number of Create Flows from [GetCreateFlows()](#create-telemetry-create-flow-functions-getcreateflows) which had:
    * `CreateBladeOpened == true`.
* Started
  * The total number of creates that were started.
  * Calculated by taking the total count of the number of Create Flows from [GetCreateFlows()](#create-telemetry-create-flow-functions-getcreateflows) which had:
    * `PortalCreateStarted == true`
    * or `ArmDeploymentStarted == true`
  * *Note - We check both of these for redundancy proof becuase we know that as long as one of these properties are true then we know a create was started.*
* Excluded
  * The total number of creates from [GetCreateFlows()](#create-telemetry-create-flow-functions-getcreateflows) that were marked as Excluded.
  * *See [GetCreateFlows()](#create-telemetry-create-flow-functions-getcreateflows) documentation for Excluded details.*
* Completed
  * The total number of creates that were completed.
  * Completed = Started - Excluded
* StartRate
  * The rate of create blades that are opened which leads to a create being started.
  * StartRate = Started / CreateBladeOpened
* Succeeded
  * The total number of creates that succeeded.
* SuccessRate
  * The overall rate of completed creates which succeeded.
  * SuccessRate = Succeeded / Completed
* Failed
  * The total number of creates that failed.
* FailureRate
  * The overrall rate of completed creates which failed.
  * FailureRate = Failed / Completed
* Canceled
  * The total number of creates which were canceled.
* CommerceError
  * The total number of creates which were aborted due to a commerce error.
* Unknown
  * The total number of creates which do not have a known result.
  
<a name="a-name-faq-a-faq"></a>
# <a name="FAQ"></a>FAQ

<a name="a-name-faq-a-faq-i-want-to-query-for-a-large-time-frame-14d-but-i-m-getting-the-error-accumulated-string-too-large"></a>
### I want to query for a large time frame (+14d) but I&#39;m getting the error, <code>‘accumulated string too large’</code>

This is a low level internal Kusto constraint which limits the amount of records we are able work with across multiple clusters/databases at a time. This limit is more noticeable now because we are connecting large amounts of data directly with ARM (data is stored on a different cluster).  

We have worked with Kusto on how to work around this for teams/users who wish to query large data sets (like 30 days) and they have a solution for us which you can use on your query:

```sql
set notruncation;
```

Add this to your query and it will let you query larger data sets. 

We are hoping that we can work with Kusto to have a configuration in our function set for this, but for now this is the only option available.

If you are still unable to execute your query over the time you want, try breaking up the query into multiple time frames and union the results. Here is an example of a 30 day query broken up into 2:

```sql
set notruncation;
let startTime = datetime(2017-09-01);
let endTime = datetime(2017-10-01);
let midTime = startTime + ((endTime - startTime) / 2);
GetCreateFlows(startTime, midTime)
| where Extension  == "HubsExtension"
| where Blade == "CreateEmptyResourceGroupBlade"
| where ExecutionStatus == "Failed"
| union (
GetCreateFlows(midTime, endTime)
| where Extension  == "HubsExtension"
| where Blade == "CreateEmptyResourceGroupBlade"
| where ExecutionStatus == "Failed"
)
```

Note: Worried about duplicates caused from unions? Just remember the end date is exclusive for GetCreateFlows() and follow the pattern as demonstrated in the example above.

<a name="a-name-faq-a-faq-i-m-getting-the-error-request-execution-has-timed-out-on-the-service-side-and-was-aborted"></a>
### I&#39;m getting the error, <code>Request execution has timed-out on the service side and was aborted.</code>

The curernt Kusto timeout limit for a query is 4:30. If this is happening when you are simply calling one of the CreateFlow functions then thecluster could be under stress or one of the dependent services is down at the moment. 

Try again after waiting some time or at non-peak hours which are between 9am-10am & 3pm-5pm.
