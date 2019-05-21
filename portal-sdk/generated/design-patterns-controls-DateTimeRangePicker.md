# DateTimeRangePicker

 
<a name="basics"></a>
### Basics
The DateTimeRangePicker control provides an easy way select a date/time range, e.g. Start: 6/5/2017 00:00:00 AM, End: 7/9/2018 00:00:00 AM



<!-- TODO get an IMAGE to embed here -->

<!-- TODO get an SAMPLE CODE to embed here -->

 
<a name="when-to-use"></a>
### When to use
Use the DateTimeRangePicker when the user must enter a date and time range.

There are a set of date, time and duration pickers available in the SDK.  Choose the one that is most suitable to your need.
* DatePicker
* DateTimePicker
* DateTimeRangePicker
* DayPicker
* DurationPicker
* TimePicker



 
<a name="best-practices"></a>
### Best practices


<a name="best-practices-do"></a>
#### Do

* Use the control as a single entity.
* Set the default date to the current date unless a specific date is required for context (e.g. the date of the conference).
* The control is designed to resize relative to available screen width. Allow it to render in either wide or narrow as appropriate.
* When the control is engaged, the DatePicker renders as a flyout and has defined widths (300px -narrow and 440px – wide). Plan your UI implementation accordingly.
* The control renders date in a specific format. If allowing for manual entry of date, provide helper text in the appropriate format.

<a name="best-practices-don-t"></a>
#### Don&#39;t

* Don't attempt to break apart year from month/day selectors. If granularity is required, use the Dropdown control or something similar.
* Don't attempt to force resize the control in any way.
* Don't force the control to render one mode vs. the other (year or month/day)
* The flyout selector is a light dismiss control. Don't modify this behavior in any way.



 
<a name="developer-tips-and-tricks"></a>
### Developer tips and tricks



<a name="developer-tips-and-tricks-interactive-control-and-sample-source-code"></a>
#### Interactive control and sample source code
To see the latest control, change options and get source code for your project, click here.

<a href="https://ms.portal.azure.com/?Microsoft_Azure_Playground=true#blade/Microsoft_Azure_Playground/ControlsIndexBlade/DateTimeRangePicker_create_Playground" target="_blank">DateTimeRangePicker in the interactive controls playground</a>

Learn more about the [controls playground](./top-extensions-controls-playground.md)


 
<a name="related-info"></a>
### Related info

* Azure design guidance:  http://aka.ms/portalfx/design


