<!-- This is the template to use when creating a new design pattern document -->
<a name="page-notifications"></a>
# Page notifications
<!-- Fill in the name above and then write a short description of the design pattern.  For example
"Forms are the manner in which we gather and validate user input."
-->

<a name="page-notifications-context"></a>
## Context
<!-- Short description of the context.  For example, "Users input information when managing Azure resources." -->

<a name="page-notifications-problem"></a>
## Problem
<!-- Short description of the problem.  For example, 
"Users want to input information to create, deploy and configure resources."
-->

<a name="page-notifications-solution"></a>
## Solution
The portal offers several mechanisms to notify users that something is wrong.


<a name="page-notifications-solution-also-known-as"></a>
### Also known as
<!-- Bulleted list of other terms used to describe the solution, if any -->

<a name="page-notifications-examples"></a>
## Examples

<a name="page-notifications-examples-example-images"></a>
### Example images
<!-- Include example image of the solution in the portal -->
<div style="max-width:800px">
<img alttext="Example image" src="../media/<folder>/<image_name>.png"  />
</div>

<a name="page-notifications-examples-example-uses"></a>
### Example uses
<!-- Descriptions and ideally deep links into the portal for running examples -->

<a name="page-notifications-use-when"></a>
## Use when
<!-- Description of when to use this solution.  For example "User is creating a resource" -->
Use in-blade notifications to alert users that something is wrong (a VM is stopped, a website exceeds its quota and is suspended, a certificate will expire soon, etc.), or that they may benefit from trying a new feature. Don't use these notifications just to tell users their services are running normally. 

Use global notifications sparingly and only for critical or high value alerts.

<a name="page-notifications-anatomy"></a>
## Anatomy
<!-- Image demonstrating the solution with numerical callouts to the solution components.
     Bulleted list of the callouts with explanations of each
-->

<a name="page-notifications-behavior"></a>
## Behavior
<!-- Description of overall behavior -->

<a name="page-notifications-behavior-in-blade-notifications"></a>
### In-blade notifications###

In-blade notifications come in a couple of different flavors:

<a name="page-notifications-behavior-in-blade-notifications-the-in-blade-notification-area"></a>
#### The in-blade notification area####

![Notification area][notification_area]

The in-blade notification area relies on color and text to communicate severity.

- Blue band + info icon: Basic information that doesn't involve warnings, errors, or a service disruption (e.g., "The VM is stopped"). 

- Yellow band + warning icon: Warnings about potential problems that require attention (e.g., "Your website's certificate is about to expire").

- Red band + error icon: Alerts about an existing problem (e.g., "Your website's certificate has expired").

- Purple band + rocket icon: No problems to report, but we're recommending an additional feature, a separate service, or anything else that the user doesn't have (but might want). Also known as "upsell."

<a name="page-notifications-behavior-in-blade-notifications-the-recommendation-blades"></a>
#### The recommendation blades####

![Recommendation blades][recco_blades]

Use the pattern shown here, and keep the following in mind:

- Use a thin blade
- Include a title and a paragraph of text in the blade whitespace
- Follow the explanation paragraph with a blue button that takes action on the notification. After the user clicks the blue action button, be sure to trigger a local notification to track progress. When the process is complete, show the success blade (on the right above) 
- If you're recommending a pricing tier upgrade, use the pricing tier comparison control shown in the middle blade

	Carry the severity color over from the previous blade (as shown on the left blade above). We do this automatically for you, so you get this for free.

<a name="page-notifications-behavior-global-notifications"></a>
### Global notifications###

Global notifications show up in the notifications hub. When a user clicks the notification, it launches your resource blade and the recommendation blade.

![Notification hub][notification_hub]
 
Use a global notification when:

- Visibility is critical and you want a user to see your notification right after they log in (even if they don't open one of your blades)
- Your recommendation is low volume and high value

	To cut down on volume, avoid sending notifications for multiple instances stemming from the same underlying issue. Separate your notifications into two buckets: the most important go into the global bucket, and the less important can show up when a user opens your resource blades.

	High value notifications might prevent service disruptions, or they may result from research you've done that leads you to believe a high percentage of users will act on your recommendation. Keep in mind that we'll be measuring conversion rates and may ask partners to remove recommendations with low uptake.

If you think your notification warrants the global treatment, contact [Ibiza Fx PM](mailto:ibizafxpm@microsoft.com). We want to avoid spamming users, so the total number of global notifications will be limited. We'll want to collaborate to measure conversion rates, which will involve sharing and analyzing data from multiple sources. 

<a name="page-notifications-do"></a>
## Do
<!-- Bulleted list of reminders for best practices-->

<a name="page-notifications-don-t"></a>
## Don&#39;t
<!-- Bulleted list of things to avoid -->

<a name="page-notifications-related-design-guidelines"></a>
## Related design guidelines
<!-- Links to Related design guidelines.  Always include the link to the readme -->
* Design guidelines [top-design.md](top-design.md)

<a name="page-notifications-research-and-usability"></a>
## Research and usability
<!-- Links to the research for the solution -->

<a name="page-notifications-telemetry"></a>
## Telemetry
<!-- Links to portal telemetry showing the solution usage -->

<a name="for-developers"></a>
# For developers
Developers can use the following information to get started implementing this pattern

<a name="for-developers-tips-and-tricks"></a>
## Tips and tricks
<!-- Bulleted list of tips and tricks for developers -->

<a name="for-developers-related-documentation"></a>
## Related documentation
<!-- Links to related developer docs -->


[notification_area]: ../media/design-patterns-page-notifications/in-blade-notification.png
[recco_blades]: ../media/design-patterns-page-notifications/recco_blades.png
[notification_hub]: ../media/design-patterns-page-notifications/notification_topbar.png


