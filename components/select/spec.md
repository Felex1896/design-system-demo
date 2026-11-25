---
title: Select
description: Plate, states, and events of the select control
tags: [select, demo]
audience: human
scope: reference
updated: 2026-11-25
---

# Select

`cc-select` is the select plate. It paints the closed and open chrome, toggles `open`, and keeps one `cc-dropdown-menu`. While the list is closed the menu is a direct child of the host, not inside the plate. While it is open the menu moves to `document.body`. The menu holds only option rows. It has no search field and no footer.

The plate still clips its own text and chips. Color stays neutral. The surface stays transparent. The plate has no focus ring. Width is `100%`. `max-width` is `--layout-field-max-width` on `large`, `medium`, and `multiple-values`. On `small` it is `--layout-select-max-width`.

## Types

| Type | Plate |
| --- | --- |
| `large` | One choice. Height `--spacing-56`. Floating label. Placeholder and value use body-1. Chevron is `--layout-icon-size`. Hint sits under the plate. |
| `medium` | One line and no label. Height `--spacing-40`. Chevron is `--layout-mode-icon-size`. Hint sits under the plate. |
| `small` | The current value, always. Height `--layout-select-height`. Body-2. Chevron is `--layout-mode-icon-size`. Padding matches the header select: inline start `--spacing-8` plus `--spacing-4`, gap `--spacing-8`, radius `--radius-4`. No label, hint, placeholder, required star, or error chrome. `max-width` is `--layout-select-max-width`. |
| `multiple-values` | Empty plate matches `large`, including the chevron. With at least one value the chevron hides. A caption label (only while `show-label` is set) sits above a wrapping row of `demo-chip` and an Add button. Add is the small no-surface accent button: height `--spacing-32`, pill radius, caption-medium, ink `--color-text-accent-default`, fill transparent, hover `--color-surface-accent-transparent-hover`, pressed `--color-surface-accent-transparent-active`. It is hidden while `open` is set, and while there are no chips. One labeled row matches the field chip plate: caption plus a 40-tall chip row inside the field padding. Without `show-label`, one row stays in the 56 plate. The plate grows until `--layout-field-max-height`, then the chip row scrolls. |

`type` defaults to `small`. Any other value is treated as `small`.

## Attributes

| Attribute | Values | Default |
| --- | --- | --- |
| `type` | `large`, `medium`, `small`, `multiple-values` | `small` |
| `state` | `default`, `error`, `disabled` | `default` |
| `open` | presence | absent |
| `value` | string, for `large`, `medium`, and `small` | empty, unfilled |
| `placeholder` | text | `Placeholder` |
| `label` | text | `Label` |
| `hint` | text | `Tell me a story` |
| `add-label` | text on the Add button | `Add` |
| `show-placeholder` | presence | hidden |
| `show-hint` | presence | hidden |
| `show-icon` | presence | hidden |
| `show-trailing` | presence | hidden |
| `show-required` | presence | hidden |
| `show-label` | presence, `multiple-values` only | hidden |

`show-required` paints the star only while a label is visible. `medium` and `small` have no label and no star. On `multiple-values`, a missing `show-label` hides the label and the star. There is no suffix.

The leading icon is the modules glyph. The trailing control is `type="button"`, `tabindex="-1"`, label `additional information`. While the pointer is over it, the page tooltip shows that phrase when `cc-tooltip` is on the page. A disabled plate does not show the tooltip.

## Options

`options` is a property, not an attribute. The setter accepts an array. Each entry is a string, `{ value, label }`, or `{ kind: "group", label }`. The element stores a normalized copy: a group stays a group; a choice becomes `{ value, label }` with both strings (a string is used for both). The getter returns a copy. Changing `options` re-renders the menu rows and does not dispatch `cc-change`.

## Value and label

On `large`, `medium`, and `small`, the `value` attribute is the choice id. The plate shows the label of the matching choice. If no choice matches, it shows the raw value. Empty means unfilled. `small` always draws that text, including when it is empty.

On `multiple-values`, the filled values are the `values` property: an array of choice ids. The getter returns a copy. The setter replaces the chips and dispatches nothing. It is not reflected to an attribute. Each chip shows the label for that id, or the raw id when nothing matches.

The label uses body-1 in the value line. It floats at caption size when the value is non-empty, `show-placeholder` is set, or `open` is set. While it floats on `large` or on an empty `multiple-values` plate, the value line stays in the stack even when it has no text, so the caption sits on that line instead of centering in the plate. The required star follows the label. Its fill is `--color-text-danger-default`. Placeholder text shows in the empty line when `show-placeholder` is set. On `multiple-values` that line is used only while there are no chips.

## State

| State | What you see |
| --- | --- |
| `default` | Transparent plate. Hover uses `--color-surface-neutral-transparent-hover` only while `open` is absent. |
| `error` | Danger label, danger hint, and a danger indicator (`--color-border-danger-default`). The plate surface stays the transparent default. `open` does not restyle this into accent. `small` keeps the default plate, and the value stays drawn. |
| `disabled` | Surface `--color-surface-neutral-transparent-disabled`. Placeholder uses `--color-text-core-disabled`. A shown value uses `--color-text-core-tertiary`. The icon uses `--color-icon-shape-core-disabled`. The plate ignores the pointer and dispatches nothing. |

`open` paints the open chrome and opens the list. `error` may stay open: the danger indicator stays, and the menu still opens. `disabled` clears `open` and ignores toggles.

When `open` is set, the host ensures one `cc-dropdown-menu`, fills it, moves it to `document.body`, sets that menu's `open` attribute, and calls `place` with the plate. The menu is `position: fixed` at `z-index: 8`, above the header, the sidebar, and the playground. Ancestors do not clip it. Width matches the plate, shifted only so the panel stays inside the viewport. The panel prefers the space under the plate, with a `--spacing-2` gap. If the full list does not fit there, it moves above the plate with the same gap. If it fits on neither side, it stays on the side with more room (under the plate when the two rooms are equal), its edge meets the viewport edge, and the rows scroll inside. While open, resize, a scroll of the plate or any ancestor, and a change in the plate's height (a growing chip row) call `place` again, so the panel stays on the plate and flips when the room changes. Scrolling the list itself does not move the panel. When `open` is removed, `open` is removed from the menu and the menu returns to the host. A `pointerdown` on the menu does not count as outside.

| Select `type` | Row |
| --- | --- |
| `small` | `cc-dropdown-action-item` with `size` `small`. |
| `large`, `medium` | `cc-select-option`. `selected` when the row value equals the select `value`. |
| `multiple-values` | `cc-checkbox-option`. `selected` when `values` includes that choice. |
| `{ kind: "group" }` | `cc-option-group` with that label. A group is not a choice. |

Each choice row gets `label` and `value`.

On `large` and `medium`, while `show-placeholder` is set, the menu starts with one extra row: label `Nothing selected`, value empty, `data-empty`. Its text is `--color-text-core-tertiary`. It is `selected` while the plate value is empty. Picking it writes an empty `value` and closes the list. `small` and `multiple-values` do not get this row. A stored choice whose value is already empty is not repeated under it.

While the list is open, a `pointerdown` whose `composedPath` does not include this element clears `open`. `Escape` clears `open` and calls `preventDefault`. Those listeners are removed when the list closes or the element disconnects.

| `open` on | What you see |
| --- | --- |
| `large`, `medium`, `multiple-values`, state `default` | Accent label (`--color-text-accent-default`) and a bottom indicator (`--color-border-accent-solid`, height `--stroke-2`). No focus ring. |
| `small`, state `default` or `error` | Plate fill `--color-surface-neutral-transparent-active`. No indicator and no label. |

The indicator is drawn for `open` on a non-small, non-disabled plate, and for `error` on a non-small plate. A quiet default plate has none. The caret rotates 180 degrees while `open` is present. There is one caret.

Value text uses `--color-text-core-primary` on default, open, and error. Placeholder uses `--color-text-core-tertiary`. On an open `large` or `multiple-values` plate with an empty value, placeholder uses `--color-text-core-disabled`. An open `medium` placeholder stays tertiary. The label at rest uses `--color-text-core-secondary`. The hint uses `--color-text-core-tertiary` unless the state is `error`. The icon uses `--color-icon-shape-core-default`.

## Events

| Event | When | `detail` |
| --- | --- | --- |
| `cc-toggle` | Click on the plate, a chip (not its clear), or Add. The info button does not toggle. Bubbles. Toggles `open`. | `{ source: "plate" }` or `{ source: "add" }` |
| `cc-change` | A choice on `small`, `large`, or `medium` is picked. The `value` attribute becomes that id. The list closes. | `{ value }` |
| `cc-change` | A checkbox row is picked. `values` is rebuilt from the checkbox rows that have `selected`. The list stays open. | `{ values }` copy of the ids |
| `cc-change` | A chip clear removes that id from `values` and clears `selected` on a checkbox whose value is no longer selected. The list stays open. Does not send `cc-toggle`. | `{ values }` copy of the remaining ids |

A disabled plate ignores those clicks.
