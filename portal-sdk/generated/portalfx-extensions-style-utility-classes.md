<a name="style-guide-for-designers"></a>
## Style Guide: For designers
For an overall style guide refer to the [design-patterns-style-guide.md](design-patterns-style-guide.md)

<a name="style-utility-classes"></a>
## Style: Utility Classes

There are several built-in classes that make working with the portal just a little bit easier.

<a name="style-utility-classes-code-formatting"></a>
### Code Formatting

```html
<pre class="msportalfx-code"><code>// this is code</code></pre>
```

In addition to using the `msportalfx-code` class, text blocks may be set to use a monospace style font:

```html
<div class="msportalfx-font-monospace">msportalfx-font-monospace</div>
```

<a name="style-utility-classes-utility-classes"></a>
### Utility Classes

```
msportalfx-removepartpadding
```
>Remove default padding on a part template.

```
msportalfx-removepartpaddingside
```
> Remove padding on the side only of a part template.

```
msportalfx-partdivider
```
> Sets up a horizontal side to side divider within the part.

```
msportalfx-clearfix
```
> Applied to a container that contains floated elements, ensures the container gets a size and that DOM element following the container flows the document normally with no overlap.

<a name="style-utility-classes-deprecated-classes"></a>
### Deprecated Classes
The following classes helped when Ibiza development was more restricted. Though still functional, those classes may be removed in the future.

```
msportalfx-removeTableBorders
```
> Removes all borders from a TABLE element.

```
msportalfx-boxsizing-borderbox
```
> Changes layout to include padding and borders in its width and height.

```
msportalfx-removeDefaultListStyle
```
> Remove bullets from a `ul` or `ol` element.

```
msportalfx-lineheight-reset
```
> Reset the line height back to the default of the current font size.

```
msportalfx-gridcolumn-asseticon
```
> Applied as the css class name for a grid column which is showing an asset SVG icon.

```
msportalfx-gridcolumn-statusicon
```
> Applied as the css class name for a grid column which is showing a status SVG icon.
