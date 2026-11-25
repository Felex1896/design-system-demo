---
title: Field
description: Development specification of the text field and its chip
tags: [field, demo, spec]
audience: both
scope: reference
updated: 2026-11-25
---

# Field

`demo-field` is a single-line, multi-line, or chip text field. One element covers four kinds. Color is always neutral. The plate surface is transparent. There is no focus ring on the plate. Width is `100%`, capped at `--layout-field-max-width`.

Copy is fixed, not an attribute: label `Label`, placeholder `Placeholder`, hint `Tell me a story`, suffix `Km`. The typed value is internal. It is not reflected to an attribute.

## Attributes

| Attribute | Values | Default | Effect |
| --- | --- | --- | --- |
| `kind` | `field-standard`, `field-medium`, `field-text-area`, `field-with-chips` | `field-standard` | Plate shape and entry widget. Any other value keeps the standard plate: height `--spacing-56` and a single-line input. |
| `state` | `default`, `error`, `disabled` | `default` | Paint and whether the field accepts input. |
| `show-placeholder` | presence | absent | Empty entry shows `Placeholder`. Also floats the label. |
| `show-hint` | presence | absent | Hint under the plate. |
| `show-icon` | presence | absent | Leading modules glyph. |
| `show-suffix` | presence | absent | Suffix `Km`. Ignored on `field-text-area` and `field-with-chips`. |
| `show-trailing` | presence | absent | Trailing info button. |
| `show-required` | presence | absent | Danger star, only while a label is visible. |
| `show-label` | presence | absent | On `field-with-chips` only. Missing hides the label and the star. Other kinds ignore it and show a label unless the kind is `field-medium`. |

`data-active` is set by the field while it is the active field. `data-float`, `data-empty`, `data-chips`, `data-label`, `data-kind`, and `data-state` are paint hooks the field writes itself. A host does not set them.

## Plate

The plate is a row: optional icon, text stack, optional trail, bottom indicator. Padding inline is `--spacing-12`. Radius is `--radius-4`. The indicator is `--stroke-2` tall, full width, along the bottom edge. A quiet default plate draws no indicator.

| Kind | Plate |
| --- | --- |
| `field-standard` | Height `--spacing-56`. Label and value share one line. Entry is an `input`. |
| `field-medium` | Height `--spacing-40`. No label and no star. Entry is an `input`. |
| `field-text-area` | Height `--layout-field-max-height`. Aligns to the start. Entry is a `textarea`. While quiet, the label block is the top `--spacing-56` and the text is vertically centered in that band. While floated, the text fills the plate and the textarea scrolls. |
| `field-with-chips` | `min-height` `--spacing-56`, `max-height` `--layout-field-max-height`, height from content. Empty and unlabeled stays in `--spacing-56`. A visible label plus one chip is taller: caption plus a chip row inside `--spacing-8` block padding. Chips wrap. Past the max height only the chip row scrolls. The label stays put. The scrollbar is on the field's right edge (`--layout-scrollbar-size`, thumb `--color-border-core-subtle`). Text keeps `--spacing-12` before that edge, and the same `--spacing-12` before the trailing button when the trail is shown. |

The leading icon is `--layout-icon-size`, with `--spacing-12` before the text. On `field-text-area` the icon and the trail stay in the top `--spacing-56`. The trail button is `--layout-icon-button-size`, `type="button"`, `tabindex="-1"`, accessible name `additional information`. `mousedown` on it calls `preventDefault` so the field does not blur.

## Label

`field-medium` never floats and never shows a label.

On the other kinds the label floats when any of these is true:

1. The entry has text, or `field-with-chips` has at least one chip.
2. The field is active and not disabled.
3. `show-placeholder` is set.

A resting label is drawn inline on the value line, body-1, `--color-text-core-secondary`. A floating label leaves that line and sits above it at caption size, with no gap between the caption and the entry. The required star follows the label. Its fill is `--color-text-danger-default`, or `--color-text-core-disabled` when the field is disabled.

## Paint

| State | Plate | Label | Value | Placeholder | Hint | Icon |
| --- | --- | --- | --- | --- | --- | --- |
| `default`, quiet | `--color-surface-neutral-transparent-default` | secondary | primary | tertiary | tertiary | `--color-icon-shape-core-default` |
| `default`, hover, not active | `--color-surface-neutral-transparent-hover` | secondary | primary | tertiary | tertiary | default |
| `default`, active | transparent default | `--color-text-accent-default` | primary | `--color-text-core-disabled` | tertiary | default |
| `error` | transparent default | `--color-text-danger-default` | primary | tertiary, disabled while active | `--color-text-danger-default` | default |
| `disabled` | `--color-surface-neutral-transparent-disabled` | disabled | tertiary | `--color-text-core-disabled` | disabled | `--color-icon-shape-core-disabled` |

An active default plate draws the indicator in `--color-border-accent-solid`. An error plate draws it in `--color-border-danger-default` whether or not the field is active. Hover does not restyle an error plate or a disabled plate. A disabled plate sets `disabled` on the entry, clears `data-active`, and ignores pointer activation.

The suffix uses tertiary text. It uses disabled text while the field is empty (`data-empty`: no entry text and no chips) or disabled.

## Activation

1. `pointerdown` on the plate focuses the entry and makes the field active.
2. The handler returns immediately when `state` is `disabled`.
3. It also returns, without focusing, when the target is the chip clear, the info button, or the entry itself.
4. Otherwise it calls `preventDefault`, clears a marked chip, unhides the entry, and focuses it.
5. If focus does not land on the entry, the field repaints and stays inactive.
6. `focusin` on the host makes the field active. `focusout` whose `relatedTarget` is still inside the host does nothing.
7. `focusout` that leaves the host clears the marked chip, deactivates, and commits a chip entry.

`demo-active` bubbles when `data-active` actually changes.

## Typing

`input` on the entry copies the text into the internal value and into the other entry widget, clears the marked chip, and repaints. The placeholder attribute is set only while `show-placeholder` is present and the value is empty. On `field-with-chips` the input is hidden until the label is floated. The textarea is hidden unless the kind is `field-text-area`.

## Chips

Used only by `field-with-chips`. Each chip is a `demo-chip` (below). The same text may be stored twice. Order is insertion order.

Commit runs on Enter in the chip entry, and on leaving the field:

1. Disabled does nothing.
2. The value is trimmed. An empty result clears the entry and adds no chip.
3. Otherwise the trimmed text is appended, and the entry is cleared.

The chip clear button dispatches `demo-clear`. The field removes that chip by its `data-index`, shifts the marked index when it sat after the removed chip, and leaves the entry text as it was. A disabled field ignores `demo-clear`. Disabled chips are not clickable.

Backspace in the chip entry, and only there:

1. Ignored unless the kind is `field-with-chips`, the state is not `disabled`, the entry is empty, and at least one chip exists.
2. `preventDefault`.
3. The first Backspace sets the marked index to the last chip.
4. The next Backspace removes that chip and clears the mark.
5. Typing or leaving the field clears the mark.

A marked chip draws `outline` `--stroke-2` `--color-border-core-focus-outline`. The field itself draws no focus ring.

## Info tooltip

On `pointerenter` of the info button, if `cc-tooltip` is on the page and the field is not disabled, the tooltip shows `additional information` anchored to the button. `pointerleave`, and any paint while disabled, hides it. A missing tooltip is a no-op.

## Chip part

`demo-chip` is the chip the field and the multi-value select place. It is not a text field.

| Attribute | Meaning |
| --- | --- |
| `label` | Visible word. Empty when absent. |
| `disabled` | Clear button is disabled. Text is `--color-text-core-disabled`. |

The chip is an inline row: label, then a clear button. `max-width` is `--layout-field-chip-max`. Padding is `--spacing-4` `--spacing-8`. Gap is `--spacing-4`. Radius is pill. Fill is `--color-surface-neutral-transparent-default`, hover `--color-surface-neutral-transparent-hover`, pressed `--color-surface-neutral-transparent-active`. The label is body-2, one line, ellipsis, height `--spacing-24`. The clear control is a `--spacing-24` target around a `--layout-mode-icon-size` glyph, `type="button"`, `tabindex="-1"`. Its accessible name is `Remove <label>`, or `Remove` when the label is empty. `mousedown` on the clear calls `preventDefault` so the field keeps focus. `click` stops propagation and, unless disabled, bubbles `demo-clear`. The chip does not remove itself.
