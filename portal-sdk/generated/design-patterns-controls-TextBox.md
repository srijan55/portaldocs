# TextBox

 
<a name="basics"></a>
### Basics
The TextBox component enables a user to type text into an app. It's typically used to capture a single line of text, but can be configured to capture multiple lines of text. The text displays on the screen in a simple, uniform format.



<!-- TODO get an IMAGE to embed here -->

<!-- TODO get an SAMPLE CODE to embed here -->

 
<a name="when-to-use"></a>
### When to use
Use the TextBox to enable the user to enter text.


 
<a name="best-practices"></a>
### Best practices

<a name="best-practices-do"></a>
#### Do

* Use the TextBox to accept data input on a form or page.
* Label the TextBox with a helpful name.
* Provide concise helper text that specifies what content is expected to be entered.
* Provide all appropriate states for the control (static, hover, focus, engaged, unavailable, error).
* When part of a form, provide clear designations for which fields are required vs. optional.
* Provide all appropriate methods for submitting provided data (e.g. dedicated ‘Submit’ button).
* Provide all appropriate methods of clearing provided data (‘X’ or something similar).
* Allow for selection, copy and paste of field data.
* Whenever possible, format TextBox relative to the expected entry (4-digit PIN, 10-digit phone number (3 separate fields), etc).
* When long entries are expected, provide a mechanism for overflow or expansion of the control itself.
* Ensure that the TextBox is functional through use of mouse/keyboard or touch when available.
* Ensure that the TextBox is accessible through screen reader and/or other accessibility tools.

<a name="best-practices-don-t"></a>
#### Don&#39;t

* Don’t use a TextBox to render basic copy as part of a body element of a page.
* Don’t provide an unlabeled TextBox and expect that users will know what to do with it.
* Don’t place a TextBox inline with body copy.
* Don’t be overly verbose with helper text.
* Don’t occlude the entry or allow entry when the active content is not visible.


 
<a name="developer-tips-and-tricks"></a>
### Developer tips and tricks



<a name="developer-tips-and-tricks-interactive-control-and-sample-source-code"></a>
#### Interactive control and sample source code
To see the latest control, change options and get source code for your project, click here.

<a href="https://ms.portal.azure.com/?Microsoft_Azure_Playground=true#blade/Microsoft_Azure_Playground/ControlsIndexBlade/TextBox_create_Playground" target="_blank">TextBox in the interactive controls playground</a>

Learn more about the [controls playground](./top-extensions-controls-playground.md)


 
<a name="related-info"></a>
### Related info

* Azure Portal Toolkit: <a href="https://www.figma.com/file/Bwn8rmUOYtnPRwA3JoQTBn/Azure-Portal-Toolkit?node-id=3025%3A378138" target="_blank">TextBox design in figma</a>

* Azure design guidance:  http://aka.ms/portalfx/design


