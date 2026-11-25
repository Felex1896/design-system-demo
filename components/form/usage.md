---
title: Form Usage
description: How a product form is assembled from sections, fields, selects, and buttons
tags: [form, usage, demo]
audience: both
scope: reference
updated: 2026-11-25
---

# Usage

A form is a column of `form-section`, then a footer of buttons. Every input sits in a section. The footer is not a section. One view has one filled primary button.

Strings come from `data/form-copy.json`. Each key has `en` and `ru`. The language switch changes playground strings only. This document stays English.

## Section

| Rule | When |
| --- | --- |
| One section, no title | The form is a single topic. No contents list. |
| A title on every section | The form has two or more sections. The title is the name of that topic. |
| A description under the title | One sentence, and only when the title does not say what to enter. `spacing/16` between that sentence and the controls. The title is headline/h6, `text/core/secondary`. On a stacked page the title is title/1, and the gap from the title to the sentence — or to the controls, when there is no sentence — is `spacing/16`. |
| A description and no title | One untitled section may still open with that one sentence above the controls. |
| At least one input | A section with no input is not a section. |
| Gap from the title to the controls | `spacing/24` on a wide page. On a stacked page it is `spacing/16`, the same as the gap from the title to the description. |
| Gap between sections | `spacing/40` on a wide page, `spacing/24` on a stacked page. Owned by the form, not by the section. On a stacked page the gap before the buttons is `spacing/40`. |
| Space above and below the form | `spacing/40` at both ends of the scrolling stage, on a wide page and on a stacked page. |
| Scroll edge | On a wide page the header and the footer stay on the playground edges. The form scrolls through the whole playground and is clipped by its top and bottom borders. On a stacked page the scrolling stage has a `border/core/subtle` line on the top and the bottom. |
| Column width | `dimension/form-content-width`. In this prototype that measure is `--layout-field-max-width`. |

## Which control

| The requirement says | Control |
| --- | --- |
| One line of text | `field-standard` |
| A short value, and the section title already names it | `field-medium`, no floating label |
| A description | `field-text-area`. Do not stretch a single line. |
| Several values typed by the user | `field-with-chips` |
| A password | `field-standard`, trailing control shows and hides the value |
| One choice from a list | `select` `large` |
| A short choice, and the section title already names it | `select` `medium`, no floating label |
| Several choices from a list | `select` `multiple-values` |
| A priority | `select` `large` with the priority glyph of the chosen level |
| A date | `field-standard` with the calendar glyph and a `DD.MM.YYYY` mask. Typed characters are primary. The rest of the pattern uses the placeholder color. A partial mask does not block submit. |
| A time | `field-standard` with the clock glyph and an `HH:MM` mask, same colors as the date mask. A partial mask does not block submit. |
| A count | Digits only. The form spec names the minimum and the maximum. An empty count is allowed unless that field is also required. |
| A unit | suffix on the field. The suffix is the unit. The label says what to enter, and it is not a copy of the unit. |

`select` `small` is a page switch, not a form field.

A field that depends on another field stays in the section. It is disabled until the other field has the value named in the spec. Its trailing glyph marks that dependency. This page has no separate group component.

## Stack and row

| Rule | When |
| --- | --- |
| Column | The usual case. Gap `spacing/8` between rows. |
| One horizontal row | The spec groups short values: a date and a time, a login and a password, two counts. Gap `spacing/16`. Align the row to the plates. The hint hangs below and does not center the plate. |
| Hint slot | On for `field-standard`, `field-text-area`, `field-with-chips`, `select` `large`, and `select` `multiple-values`. The text is empty until the spec names a hint. |
| Several choices | The hint says that more than one value can be chosen. |
| Typed chips | The hint says to press Enter to add a value. |
| Placeholder | On when the control has no visible label. Also on when the spec names an example or a format. The label says what to enter. The placeholder says the format or shows an example. An empty placeholder is not shown. A date or time mask takes this role. |
| One choice | A `select` `large` with no way back to empty is required. An optional one shows the placeholder `Not selected`, and that same row is first in the list. Choosing it clears the value. `multiple-values` already clears by the chip or by unchecking, so it stays optional and does not get that row. |
| Required | `show-required` on that control. The star is not typed into the label. Only an enabled required control can block submit. |

## Checks

A placeholder is not a chosen value. `Not selected` clears an optional choice. An example such as `120` is not written into the field.

| Check | When | Result |
| --- | --- | --- |
| Required | On the click of a button that runs the required check. Not while typing. | Each empty enabled required control goes to `error`. Its hint becomes `Required field`. The danger snackbar says `Fill in the required fields`. Filling the control clears that error and restores the hint from the spec. |
| Range | The hint updates on every change. The block runs only on a button that runs the required check. | Below the minimum, the hint is `At least {n}`. Above the maximum, the hint is `At most {n}`. `{n}` is that limit, with grouped thousands. Empty clears the range hint. If every required control is filled and a range is still wrong, that click shows the danger snackbar `Check the entered values` and does not complete. A missing required field wins over a bad range. Apply, Reset, Set default, and Cancel do not block on a bad range. |
| Disabled | Skipped by both checks. | Turning a control off keeps what was typed. Turning it on shows that text again. |

A click that passes shows that action's success snackbar. Fields stay, except where the spec says to clear them or to write a preset. An editing form keeps the values it opened with. Apply and Set default do not replace that baseline.

| Action | Success snackbar |
| --- | --- |
| Create | `Created` |
| Add | `Added` |
| Add another | `Added` |
| Apply | `Applied` |
| Reset | `Reset` |
| Set default | `Defaults saved` |
| Cancel | `Cancelled` |
| Delete | `Deleted` |

## Buttons

Labels come from the closed set. `Delete` is the one exception, and only the cancellation spec names it.

The footer sits on the trailing edge. Importance runs back from that edge: the solid action is last, and the quieter actions sit before it.

On a stacked page every button stretches to the column width. A dismiss-and-confirm pair (`Cancel` with `Delete`, `Reset` with `Apply`) stays in one row. Other buttons in that view sit above the pair, full width. Any other set stacks, and the solid action is first.

A disabled button keeps its style and uses that style's disabled color. `Apply` stays a solid accent button: full color while it can be pressed, faded while it cannot.

A form button carries `quiet`, so the button demo tooltip does not appear on hover or press.

A click raises a snackbar, centered, `spacing/24` above the bottom of the form block. A completed action uses the inverse snackbar. An empty required field, or a value outside its range, uses the danger snackbar. The field error stays on the control.

| Label | Look | When it is enabled |
| --- | --- | --- |
| Create, Add, Apply | accent, solid. One of these per view. | Create and Add stay enabled and run the required check. Apply runs no check. It enables while the editing form differs from the values it opened with, and a click leaves those values in place. |
| Add another | accent, no-surface. Never a second solid. | Stays enabled. Same required check as Add. A passing click adds the line, then clears only the fields named in the spec, so the next line can be entered. |
| Reset | neutral, no-surface. Editing forms only. | Enables while the form differs from the values it opened with. A click writes those values back. No required check. |
| Set default | neutral, outline. Not the submit. | Always. Writes the preset from the spec. Does not move the opening baseline. No required check. |
| Cancel | neutral, no-surface. | Always. Clears the fields named in the spec. No required check. |
| Delete | danger, solid. The main action of that view. | Stays enabled and runs the required check. |

A button that is permanently unavailable is omitted. Reset and Apply stay visible and disabled until there is something to do. Create, Add, Add another, and Delete stay enabled.

## This page

The header reads `Event hall · {form name}` from the product key and the form title key. Ten forms share this document. Each form spec names its sections, controls, limits, and actions. This document names the shared rules. Switching language translates the playground and does not switch the spec. The spec copy is the English string.
