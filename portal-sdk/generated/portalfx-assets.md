* [Assets](#assets)
    * [Defining your asset type](#assets-defining-your-asset-type)
    * [Blades, parts, and commands](#assets-blades-parts-and-commands)
    * [Showing up in the Browse ("More services") menu](#assets-showing-up-in-the-browse-more-services-menu)
    * [Showing up in Browse > Recent](#assets-showing-up-in-browse-recent)
    * [Showing up in All Resources and resource group resources](#assets-showing-up-in-all-resources-and-resource-group-resources)
    * [Handling permissions for RBAC](#assets-handling-permissions-for-rbac)
    * [Special-casing ARM resource kinds](#assets-special-casing-arm-resource-kinds)
    * [Displaying multiple kinds together in a single browse view](#assets-displaying-multiple-kinds-together-in-a-single-browse-view)
    * [Handling deleted resources](#assets-handling-deleted-resources)
    * [Linking notifications to assets](#assets-linking-notifications-to-assets)
    * [ARM RP and resource type metadata](#assets-arm-rp-and-resource-type-metadata)


<a name="assets"></a>
## Assets

Assets are generic entities tracked within the portal. As generic entities, assets can identify subscription resources (e.g. websites), 
higher-level entities (e.g. AAD directory), lower-level entities (e.g. TFS work items), or things not even remotely associated with 
subscriptions (e.g. users). As an example, subscriptions, resource groups, and deployments are all tracked as assets.

Assets are used for the following experiences:

* [Notifications](portalfx-notifications.md) should be linked to an asset
* The [Browse menu](portalfx-browse.md) lists browseable asset types
* Browse > Recent only shows assets based on the asset type specified on a blade
* The All Resources view only shows resources that have asset types that implement Browse v2
* The resource group list only shows resources that have asset types with a defined `ResourceType`
* Defining [permissions](portalfx-permissions.md) in PDL requires asset types
* References to deleted assets can be cleaned up with `notifyAssetDeleted()`
* Overriding behavior for [resource kinds](#resource-kinds)

All asset types have the following requirements:

1. The asset type blade **_must_** have a single `id` parameter that is the asset id
2. The asset type part must be the same as the blade's pinned part
3. The asset type part and blade's pinned part must open the asset type's blade
4. Must call `notifyAssetDeleted()` when the resource has been deleted or is not found

Asset types that represent Azure Resource Manager (ARM) resource types also have the following requirements:

5. The asset id **_must_** be the string resource id
6. The ARM RP manifest should include a RP, resource type, and resource kind metadata

<a name="assets-defining-your-asset-type"></a>
### Defining your asset type
To define your asset type, simply add the following snippet to PDL:

```xml
<AssetType
    Name="MyAsset"
    ServiceDisplayName="{Resource MyAsset.service, Module=ClientResources}"
    SingularDisplayName="{Resource MyAsset.singular, Module=ClientResources}"
    PluralDisplayName="{Resource MyAsset.plural, Module=ClientResources}"
    LowerSingularDisplayName="{Resource MyAsset.lowerSingular, Module=ClientResources}"
    LowerPluralDisplayName="{Resource MyAsset.lowerPlural, Module=ClientResources}"
    Keywords="{Resource MyAsset.keywords, Module=ClientResources}"
    Description="{Resource MyAsset.description, Module=ClientResources}"
    Icon="{Resource Content.MyExtension.Images.myAsset, Module=./../_generated/Svg}"
    BladeName="MyAssetBlade"
    PartName="MyAssetPart"
    IsPreview="true">
  ...
</AssetType>
```

The name can be anything that follows standard variable naming guidelines. Just remember: **Once you set the asset type name, you can never change it!** Asset type names are used as pointers in multiple places (e.g. favorites, recent) and changing the asset type will cause the references to your asset type and resources to fail. **Do not change asset type names!** You'll be typing this a lot, so keep it succinct, yet clear -- it will be used to identify asset types in telemetry.

<a name="assettype-names"></a>
In order to provide a modern voice and tone within the portal, asset types have 5 different display names. The portal will use the most appropriate display name given the context. Please keep these rules in mind:

1. **Always specify `ServiceDisplayName`, if applicable.** If your service has an official, registered/trade-marked product name (e.g. App Service), specify the `ServiceDisplayName` property to ensure the service name is used when possible.
2. **Plural/singular display names *must* be nouns.** These names are used in sentences, which will not flow correctly if you use the service name when you should have a noun (e.g. "No Data Lake Store to display"). Instead, set `ServiceDisplayName` to get the appropriate handling as well as natural, grammatically correct sentences throughout the portal.
3. **Display names *must* be sentence-cased.** This applies to all text, including blade, tile, and section headers. The [Microsoft Style Guide](http://aka.ms/style) dictates that all text should be sentence-cased unless it is a product or service name. Note that nouns are not service names, even if they use the same words (e.g. the "Logic Apps" service should have a `LowerPluralDisplayName` of "logic apps"). Conversly, a service name can be used to prefix a noun (e.g. "Traffic Manager profiles").
4. **Do not lower-case acronyms.** If your asset type display name includes an acronym or starts with a product name that is always capitalized, use the same values for upper and lower display name properties (e.g. `PluralDisplayName` and `LowerPluralDisplayName` may both use `SQL databases`).
5. **Plural and singular names should *never* be the same.** Do not share strings between singular and plural display names. There is no scenario where these should be the same.
6. **Do not specify extraneous keywords in the name.** If you want customers to find your service or resource type when they search for another word (e.g. firewall), add that to the comma-delimited list of `Keywords`. These will be used when filtering in the More Services menu as well as global search.

The aforementioned display names are used in the following places:

* The Browse menu shows the `ServiceDisplayName` in the list of browseable asset types.  If `ServiceDisplayName` is not available, `PluralDisplayName` will be shown instead
* The All Resources blade uses the `SingularDisplayName` in the Type column, when visible
* Browse v2 uses the `LowerPluralDisplayName` when there are no resources (e.g. "No web apps to display")
* Browse v2 uses the `LowerPluralDisplayName` as the text filter placeholder
* Global search uses the `SingularDisplayName` to indicate what type resources are
* The Azure mobile app uses the `PluralDisplayName` in the resource type filter (support for `ServiceDisplayName` coming post-Build)
* The Azure mobile app uses the `SingularDisplayName` everywhere the resource type is displayed (i.e. resource list/detail, alert list/ detail)

Filtering functionality within the Browse menu searches over `Keywords`. `Keywords` is a comma-separated set of words or phrases which
allow users to search for your asset by identifiers other than than the set display names. 

Remember, your part and blade should both have a single `id` input parameter, which is the asset id:

```xml
<Part Name="MyAssetPart" ViewModel="MyAssetPartViewModel" AssetType="MyAsset" AssetIdProperty="id" ...>
  <Part.Properties>
    <!-- Required. Must be the only input parameter. -->
    <Property Name="id" Source="{DataInput Property=id}" />
  </Part.Properties>
  <BladeAction Blade="MyAssetBlade">
    <BladeInput Source="id" Parameter="id" />
  </BladeAction>
  ...
</Part>

<Blade Name="MyAssetBlade" ViewModel="MyAssetBladeViewModel" AssetType="MyAsset" AssetIdProperty="id">
  <Blade.Parameters>
    <!-- Required. Must be the only input parameter. -->
    <Parameter Name="id" Type="Key" />
  </Blade.Parameters>
  <Blade.Properties>
    <Property Name="id" Source="{BladeParameter Name=id}" />
  </Blade.Properties>
  ...
</Blade>
```

If your asset type is in preview, set the `IsPreview="true"` property. If the asset type is GA, simply remove the property (the default is `false`).

<a name="assets-defining-your-asset-type-how-to-hide-your-asset-in-different-environments"></a>
#### How to hide your asset in different environments

You can hide your asset in different environments by setting the hideassettypes feature flag in your config to a comma-separated list of asset type names.

<a href="https://msit.microsoftstream.com/video/7399869a-4f8f-415e-9346-5b77f069b567?st=50" target="_blank">
  Watch the Hiding Asset Types video here
  <img src="../media/portalfx-assets/hidingassettypes.png" />
</a>

<a name="assets-defining-your-asset-type-how-to-hide-your-asset-in-different-environments-self-hosted"></a>
##### Self hosted

Replace '*' with the desired environment, for documentation regarding enabling feature flags in self hosted extensions [click here.](portalfx-extension-flags.md#feature-flags)

```xml
        <Setting name="Microsoft.StbPortal.Website.Configuration.ApplicationConfiguration.DefaultQueryString" value="{
            '*': {
                     'microsoft_azure_compute_hideassettypes':"AzureContainerService,ContainerGroup,ManagedClusters,VirtualWan"
            }
        }" />
```

<a name="assets-defining-your-asset-type-how-to-hide-your-asset-in-different-environments-hosting-service"></a>
##### Hosting service

If you’re using the hosting service, you can do this by updating your domainname.json (e.g. portal.azure.cn.json file)

```json
    {
        "hideassettypes": "AzureContainerService,ContainerGroup,ManagedClusters,VirtualWan"
    }
```

Alternatively, you can hide all your assets in a specific environment by specifying:

```json
    {
        "hideassettypes": "*"
    }
```

Note, wildcard expressions are NOT supported, e.g: "AzureContainer*" will not hide all assets beginning with AzureContainer.

<a name="assets-defining-your-asset-type-how-to-hide-your-asset-in-different-environments-hosting-service-testing-your-hidden-asset"></a>
###### Testing your hidden asset

To test enable your hidden asset for testing purposes, you will need to update the hide asset feature flag to exclude the asset you want to show and ensure you have feature.canmodifyextensions set.

For the desired environment append the following feature flags.
> If you want to test showing all hidden assets, you can specify all the assets as a comma seperated list to the 'showassettypes' feature flag.

```txt
    ?feature.showassettypes=MyNewAsset
    &microsoft_azure_mynewextension=true
    &feature.canmodifyextensions=true
```

For example:
https://rc.portal.azure.com/?feature.showassettypes=VirtualMachine&microsoft_azure_compute=true&feature.canmodifyextensions=true

<a name="assets-defining-your-asset-type-handling-empty-browse"></a>
#### Handling empty browse

The framework offers the ability to display a description and links in the case that the users filters return no results.

>NOTE: This will also display if the user visits the browse experience and they have not yet created the given resource.

![Empty browse](../media/portalfx-assets/empty-browse.png)

To opt in to this experience you need to provide a `description` and a `link`, these are properties that you provide on your Asset.

```xml
<AssetType  
    Name="MyAsset"
    ...
    Description="{Resource MyAsset.description, Module=ClientResources}">
    ...
    <Link Title="{Resource MyAsset..linkTitle1, Module=ClientResources}" Uri="http://www.bing.com"/>
    <Link Title="{Resource MyAsset.linkTitle2, Module=ClientResources}" Uri="http://www.bing.com"/>
    ...
  </AssetType>
```

<a name="blades-parts-commands"></a>
<a name="assets-blades-parts-and-commands"></a>
### Blades, parts, and commands
Every blade, part, and command that represents or acts on a single asset instance should specify an `AssetType` and `AssetIdProperty`. The `AssetType` is the `Name` specified on your `<AssetType />` node and the `AssetIdProperty` is the name of the input property that contains the asset id. Remember, that should be the string resource id, if your asset is an ARM resource.

If a blade, part, or command represents or acts on multiple assets, use the primary asset type/id based on the context. For instance, when displaying information about a child asset that also obtains information about the parent, use the child's asset type/id.

<a name="assets-showing-up-in-the-browse-more-services-menu"></a>
### Showing up in the Browse (&quot;More services&quot;) menu
To show up in the Browse menu, your asset type must specify the `<Browse Type="" />` node. The `Type` informs the Browse menu 
how to interact with your asset type. Learn more about [Browse integration](portalfx-browse.md).

Services that use [resource kinds](#resource-kinds) can also be added to the Browse menu, but that must be configured by the Fx team. To do this, [create a partner request](http://aka.ms/portalfx/request) with the asset type name and kind value.

<a name="assets-showing-up-in-browse-recent"></a>
### Showing up in Browse &gt; Recent
The Recent list in the Browse menu shows asset instances that have been interacted with. The portal tracks this via the 
`AssetType` and `AssetIdProperty` on each blade that is launched. See [Blades, parts, and commands](#blades-parts-commands) 
above for more information.

<a name="assets-showing-up-in-all-resources-and-resource-group-resources"></a>
### Showing up in All Resources and resource group resources
The All Resources and resource group blades show all resources except alert rules, autoscale settings, and dashboards. Resources that aren't backed by an asset type use a very basic resource menu blade that exposes properties, RBAC, tags, locks, and activity log.

To implement the most basic asset type, add the asset type definition (including display names, icon, blade, and part), add `<Browse Type="ResourceType" />` for [no-code Browse](portalfx-browse.md), and then include a `<ResourceType ResourceTypeName="" ApiVersion="" />` declaration.

<a name="assets-handling-permissions-for-rbac"></a>
### Handling permissions for RBAC
To ensure your blades, parts, and commands react to the user not having access, you can add an `AssetType`, `AssetIdProperty`, and required `Permissions` to your blades, parts, and commands. Learn more about [Permissions](portalfx-permissions.md).

<a name="resource-kinds"></a>
<a name="assets-special-casing-arm-resource-kinds"></a>
### Special-casing ARM resource kinds
The portal supports overriding the following default behaviors based on the resource kind value:

* Hiding resources in Browse and resource groups
* Displaying separate icons throughout the portal
* Launching different blades when an asset is opened
* Merging kinds to display in a single browse view


The kind value can be whatever value makes sense for your scenarios. Just add supported kinds to the `AssetType` PDL:

```xml
<AssetType ...>
  ...
  <ResourceType ...>
    <Kind Name="kind1" />
    <Kind Name="kind2" />
    <Kind Name="kind3" />
  </ResourceType>
</AssetType>
```

`Name` is the only required attribute. None of the other attributes for kinds are required. Simply specify the 
behaviors you want to override from your asset type and you're done.

| Attribute | Description |
|-----------|-------------|
| Name | (Required) Kind value assigned to resource types. |
| `IsDefault` | (Optional) Ignores the `Name` value and applies overrides to the default (empty) kind value. Teams are recommended to avoid this, if possible. |
| `BladeName` | (Optional) Specifies the blade to launch when this kind is opened from a Fx resource list. |
| `CompositeDisplayName` | (Optional) Overrides the type name shown in resource lists. The `ComposityDisplayName` is a convention-based reference to multiple RESX strings. For instance, `CompositeDisplayName="MyAsset"` would map to the following 4 RESX strings: `MyAsset_pluralDisplayName`, `MyAsset_singularDisplayName`, `MyAsset_lowerPluralDisplayName`, and `MyAsset_lowerSingularDisplayName`. |
| `Icon` | (Optional) Overrides the asset type's icon. |
| `IsPreview` | (Optional) Indicates a preview label should be shown in the Browse (More services) menu, if applicable. |
| `Keywords` | (Optional) Specifies the keywords to use when filtering in the Browse (More services) menu, if applicable. |
| `MarketplaceItemId` | (Optional) Specifies the Marketplace item id (aka gallery package id) to launch from the "Add" command on the resource type Browse blade, if applicable. |
| `MarketplaceMenuItemId` | (Optional) Specifies the Marketplace menu item to launch from the "Add" command on the resource type Browse blade, if applicable. |
| `ServiceDisplayName` | (Optional) Overrides the text to use in the Browse (More services) menu, if applicable. |
| `UseResourceMenu` | (Optional) Overrides the asset type's `UseResourceMenu` flag. |
| `Visibility` | (Optional) Indicates whether the kind should be hidden from resource lists. Values: `Hidden`. |

If different kinds need to opt in to a static resource menu overview item, add the `<StaticOverview />` node.

```xml
<Kind ...>
  <StaticOverview />
</Kind>
```

<a name="assets-displaying-multiple-kinds-together-in-a-single-browse-view"></a>
### Displaying multiple kinds together in a single browse view

There are two options for displaying multiple kinds as a single view. Both cases require exposing a entry for your asset. 

1. Merging multiple kinds together via any of each kind's browse entry (MergedKind)
1. Exposing a logical kind (KindGroup) which acts as a single entry point for multiple kinds.

<a name="assets-displaying-multiple-kinds-together-in-a-single-browse-view-mergedkind"></a>
#### MergedKind

To expose your resources as a merged kind you need to define the kinds you wish to merge as below.

```xml
<AssetType Name="Watch">
    <ResourceType ResourceTypeName="Microsoft.Test/watches"
                  ApiVersion="2017-04-01">
      <!--
        The 'garmin-merged' kind has two merged kinds, 'garmin' and 'garmin2'. The 'garmin-merged' kind is not a real
        kind and is not emitted to the manifest as a kind, it is organizational only.
      -->
      <MergedKind Name="garmin-merged">
        <Kind Name="garmin"
              CompositeDisplayName="{Resource AssetTypeNames.Watch.Garmin, Module=ClientResources}"
              Icon="{Svg IsLogo=true, File=../../Svg/Watches/garmin.svg}"
              BladeName="GarminWatchBlade"
              PartName="GarminWatchTile" />
        <Kind Name="garmin2"
              CompositeDisplayName="{Resource AssetTypeNames.Watch.Garmin2, Module=ClientResources}"
              Icon="{Svg IsLogo=true, File=../../Svg/Watches/garmin2.svg}"
              BladeName="Garmin2WatchBlade"
              PartName="Garmin2WatchTile" />
      </MergedKind>
    </ResourceType>
  </AssetType>
```

<a name="assets-displaying-multiple-kinds-together-in-a-single-browse-view-kindgroup"></a>
#### KindGroup

To expose your resources as grouped as a single kind you will need to define the below.
Note both lg and samsung in the example below will be exposed as entries too.

```xml
<AssetType Name="Watch">
    <ResourceType ResourceTypeName="Microsoft.Test/watches"
                  ApiVersion="2017-04-01">
      <Kind Name="lg"
            CompositeDisplayName="{Resource AssetTypeNames.Watch.LG, Module=ClientResources}"
            Icon="{Svg IsLogo=true, File=../../Svg/Watches/lg.svg}"
            BladeName="LgWatchBlade"
            PartName="LgWatchTile" />
      <Kind Name="samsung"
            CompositeDisplayName="{Resource AssetTypeNames.Watch.Samsung, Module=ClientResources}"
            Icon="{Svg IsLogo=true, File=../../Svg/Watches/samsung.svg}"
            BladeName="SamsungWatchBlade"
            PartName="SamsungWatchTile" />
      <!--
        The 'android' kind group wraps the lg and samsung kinds into a single kind. The 'android' kind is an abstract
        kind. There should never be a watch with the kind set to 'android'. Instead it's used to group kinds into
        a single list. However, 'lg' watches and be seen separately, same with 'samsung' watches. The 'android' kind
        will be emitted to the manifest as a kind.
      -->
      <KindGroup Name="android"
            CompositeDisplayName="{Resource AssetTypeNames.Watch.Android, Module=ClientResources}"
            Icon="{Svg IsLogo=true, File=../../Svg/Watches/android.svg}">
        <KindReference KindName="lg" />
        <KindReference KindName="samsung" />
      </KindGroup>
    </ResourceType>
  </AssetType>
```

<a name='notify-asset-deleted'></a>
<a name="assets-handling-deleted-resources"></a>
### Handling deleted resources
The portal includes many references to assets, like pinned parts on the dashboard, recent items, and more. All references 
are persisted to user settings and available when the user signs in again. When an asset is deleted, the portal needs to be 
notified that these references need to be cleaned up. To do that, simply call 
`MsPortalFx.UI.AssetManager.notifyAssetDeleted()`.

It's important to note that assets can obviously be deleted outside the portal. When an asset is deleted outside of the portal and `notifyAssetDeleted()` cannot be called, these references will not be cleaned up. When the user signs in again, they will still see pinned parts, for instance. These parts will most likely fail to load due to a 404 from your back-end service due to the asset not existing anymore. When you get a 404 for an asset id, always call `notifyAssetDeleted()` to ensure the portal has a chance to clean up.

<a name="assets-linking-notifications-to-assets"></a>
### Linking notifications to assets
To link a notification to an asset, simply include an asset reference (`AssetTriplet`) in the notification:

```ts
MsPortalFx.Hubs.Notifications.ClientNotification.publish({
    title: resx.myEvent.title,
    description: resx.myEvent.description,
    status: MsPortalFx.Hubs.Notifications.NotificationStatus.Information,
    asset: {
        extensionName: ExtensionDefinition.definitionName,
        assetType: ExtensionDefinition.AssetTypes.MyAsset.name,
        assetId: assetId
    }
});
```

Learn more about [notifications](portalfx-notifications.md).

<a name="assets-arm-rp-and-resource-type-metadata"></a>
### ARM RP and resource type metadata
Every ARM resource provider (RP) should have a default RP icon as well as a resource type icon specified in the RP manifest to support the following scenarios:

* The AAD custom role management UI uses the resource type icon for resource type actions
* Visual Studio uses the resource type icon in its list of resources
* The portal uses the RP icon when a blade isn't associated with an asset type and doesn't have an icon
* When a resource type icon isn't provided, the RP icon is used

When an icon is not specified, each experience will use the `MsPortalFx.Base.Images.Polychromatic.ResourceDefault()` icon:

<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="50px" height="50px" viewBox="0 0 50 50" enable-background="new 0 0 50 50" xml:space="preserve">
    <path fill="#3999C6" d="M25.561,23.167c-0.103,0-0.197-0.03-0.288-0.083L6.011,12.045c-0.183-0.103-0.292-0.297-0.292-0.506 c0-0.203,0.108-0.395,0.292-0.496L25.149,0.075c0.182-0.1,0.405-0.1,0.579,0L44.994,11.12c0.174,0.102,0.29,0.291,0.29,0.496 c0,0.212-0.116,0.4-0.29,0.504L25.853,23.084C25.762,23.137,25.665,23.167,25.561,23.167"/>
    <path fill="#59B4D9" d="M22.792,50c-0.104,0-0.207-0.024-0.295-0.077L3.295,38.917C3.11,38.814,3,38.626,3,38.416V16.331 c0-0.207,0.11-0.397,0.295-0.506c0.176-0.1,0.401-0.1,0.586,0L23.08,26.831c0.178,0.107,0.286,0.297,0.286,0.504v22.086 c0,0.212-0.108,0.397-0.286,0.502C22.985,49.976,22.888,50,22.792,50"/>
    <path fill="#59B4D9" d="M28.225,50c-0.098,0-0.199-0.024-0.295-0.077c-0.178-0.105-0.288-0.289-0.288-0.502V27.478 c0-0.207,0.11-0.397,0.288-0.504l19.196-11.002c0.185-0.102,0.403-0.102,0.587,0c0.176,0.103,0.287,0.295,0.287,0.5v21.943 c0,0.211-0.111,0.398-0.287,0.502L28.511,49.923C28.429,49.976,28.325,50,28.225,50"/>
    <path opacity="0.5" fill="#FFFFFF" d="M28.225,50c-0.098,0-0.199-0.024-0.295-0.077c-0.178-0.105-0.288-0.289-0.288-0.502V27.478 c0-0.207,0.11-0.397,0.288-0.504l19.196-11.002c0.185-0.102,0.403-0.102,0.587,0c0.176,0.103,0.287,0.295,0.287,0.5v21.943 c0,0.211-0.111,0.398-0.287,0.502L28.511,49.923C28.429,49.976,28.325,50,28.225,50"/>
</svg>

To specify an RP icon, add the following portal metadata snippet:

```ts
{
    "namespace": "rp.namespace",
    "metadata": {
        "portal": {
            "icon": "<svg>...</svg>"
        }
    },
    ...
}
```

To specify a resource type icons, add the same snippet to each resource type definition:

```ts
{
    "namespace": "rp.namespace",
    "metadata": {
        "portal": {
            "icon": "<svg>...</svg>"
        }
    },
    ...
    "resourceTypes": [
        {
            "resourceType": "instances",
            "metadata": {
                "portal": {
                    "icon": "https://..."
                }
            },
            ...
        },
        ...
    ],
    ...
}
```

Icons can be either SVG XML or a standard HTTPS URL. SVG XML is preferred for scalability and rendering performance; however, HTTPS URLs are better if your RP manifest is too large.

To retrieve RP manifests for a subscription, call `GET /subscriptions/###/providers?$expand=metadata`.
