# CheckBox

 
<a name="basics"></a>
### Basics
A CheckBox is a UI element that allows users to switch between two mutually exclusive options (checked or unchecked, on or off) through a single click or tap. It can also be used to indicate a subordinate setting or preference when paired with another control.



<!-- TODO get an IMAGE to embed here -->

<!-- TODO get an SAMPLE CODE to embed here -->

 
<a name="when-to-use"></a>
### When to use
A CheckBox is used to select or deselect action items. It can be used for a single item or for a list of multiple items that a user can choose from. The control has two selection states: unselected and selected.

Use a single CheckBox for a subordinate setting, such as with a "Remember me?" login scenario or with a terms of service agreement.

For a binary choice, the main difference between a CheckBox and a toggle switch is that the CheckBox is for status and the toggle switch is for action. You can delay committing a CheckBox interaction (as part of a form submit, for example), while you should immediately commit a toggle switch interaction. Also, only CheckBoxes allow for multi-selection.

Use multiple CheckBoxes for multi-select scenarios in which a user chooses one or more items from a group of choices that are not mutually exclusive.


 
<a name="best-practices"></a>
### Best practices

<a name="best-practices-do"></a>
#### Do

* Allow users to choose any combination of options when several CheckBoxes are grouped together.

<a name="best-practices-don-t"></a>
#### Don&#39;t

* Don't use a CheckBox as an on/off control. Instead use a toggle switch.
* Don’t use a CheckBox when the user can choose only one option from the group, use radio buttons instead.
* Don't put two groups of CheckBoxes next to each other. Separate the two groups with labels.



 
<a name="developer-tips-and-tricks"></a>
### Developer tips and tricks



<a name="developer-tips-and-tricks-interactive-control-and-sample-source-code"></a>
#### Interactive control and sample source code
To see the latest control, change options and get source code for your project, click here.

<a href="https://ms.portal.azure.com/?Microsoft_Azure_Playground=true#blade/Microsoft_Azure_Playground/ControlsIndexBlade/CheckBox_create_Playground" target="_blank">CheckBox in the interactive controls playground</a>

Learn more about the [controls playground](./top-extensions-controls-playground.md)

 
<a name="related-info"></a>
### Related info

* Azure Portal Toolkit: <a href="https://www.figma.com/file/Bwn8rmUOYtnPRwA3JoQTBn/Azure-Portal-Toolkit?node-id=3023%3A49" target="_blank">CheckBox design in figma</a>

* Azure design guidance:  http://aka.ms/portalfx/design


