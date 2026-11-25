---
title: Select
description: Development specification of the select, its menu, and its rows
tags: [select, demo, spec]
audience: both
scope: reference
updated: 2026-11-25
---

# Select

`cc-select` is a closed plate plus one `cc-dropdown-menu`. The menu holds option rows only. It has no search and no footer. The plate clips its own text and chips. Ancestors do not clip the open menu, because the menu is portaled. Color of the plate stays neutral. The plate surface stays transparent. There is no focus ring.

Width is `100%`. `max-width` is `--layout-field-max-width` on `large`, `medium`, and `multiple-values`. On `small` it is `--layout-select-max-width`.

## Attributes

| Attribute | Values | Default | Effect |
| --- | --- | --- | --- |
| `type` | `large`, `medium`, `small`, `multiple-values` | `small` | Plate and row kind. Any other value is `small`. |
| `state` | `default`, `error`, `disabled` | `default` | Paint and whether the plate accepts a toggle. Any other value is `default`. |
| `open` | presence | absent | List is open. The field sets and clears this itself. A host may set it. |
| `value` | string | empty | Selected id on `large`, `medium`, and `small`. Not used as the chip list. |
| `placeholder` | text | `Placeholder` | Empty value line when `show-placeholder` is set. |
| `label` | text | `Label` | Label copy. |
| `hint` | text | `Tell me a story` | Hint copy. |
| `add-label` | text | `Add` | Add button copy. |
| `show-placeholder` | presence | absent | Shows the placeholder and, on `large` and `medium`, the empty menu row. |
| `show-hint` | presence | absent | Hint under the plate. `small` never shows a hint. |
| `show-icon` | presence | absent | Leading modules glyph. |
| `show-trailing` | presence | absent | Trailing info button. |
| `show-required` | presence | absent | Danger star, only while a label is visible. |
| `show-label` | presence | absent | `multiple-values` only. Missing hides the label and the star. |

`medium` and `small` have no label and no star. There is no suffix.

## Properties

`options` is a property, not an attribute. The setter accepts an array. Each entry is a string, `{ value, label }`, or `{ kind: "group", label }`. A string becomes `{ value, label }` with both sides equal to that string. A group keeps `kind: "group"` and stringifies `label` (`""` when nullish). A choice stringifies `value` (`""` when nullish) and uses `label` when present, otherwise the value. Anything else is dropped. The getter returns a copy. Setting `options` re-renders the menu and repaints the plate. It does not dispatch `cc-change`.

`values` is the chip list on `multiple-values`: an array of choice ids. The setter stringifies each entry, replaces the list, and repaints. It does not dispatch `cc-change` and it is not reflected to an attribute. A non-array becomes an empty list. The getter returns a copy.

## Plate

Row: optional icon, text stack, caret, optional trail, bottom indicator. Default padding inline is `--spacing-12`. Radius is `--radius-4`. The caret is one chevron. It rotates 180 degrees while `open` is set. `small` padding matches the header select: inline start `--spacing-8` plus `--spacing-4`, gap `--spacing-8`, radius `--radius-4`.

| Type | Plate |
| --- | --- |
| `large` | Height `--spacing-56`. Floating label. Placeholder and value are body-1. Chevron is `--layout-icon-size`. Hint can sit under the plate. |
| `medium` | Height `--spacing-40`. No label. Chevron is `--layout-mode-icon-size`. Hint can sit under the plate. |
| `small` | Height `--layout-select-height`. Body-2. Chevron is `--layout-mode-icon-size`. No label, hint, placeholder, required star, or error chrome. The current value is always drawn, including when it is empty. |
| `multiple-values` | Empty plate matches `large`, including the chevron. With at least one value the chevron hides. A caption (only while `show-label` is set) sits above a wrapping row of `demo-chip` and an Add button. One labeled row matches the field chip plate: caption plus a 40-tall chip row inside the field padding. Without `show-label`, one row stays in the `--spacing-56` plate. The plate grows until `--layout-field-max-height`, then the chip row scrolls. The scrollbar sits on the field's right edge. |

Add is a `button` of type `button`. It is the small no-surface accent control: height `--spacing-32`, min width `--spacing-64`, padding inline `--spacing-12`, pill radius, caption-medium, ink `--color-text-accent-default`, fill transparent, hover `--color-surface-accent-transparent-hover`, pressed `--color-surface-accent-transparent-active`. Disabled ink is `--color-text-accent-disabled` and the fill stays transparent. Add is in the DOM only as a control of this plate. It is hidden unless all three are true: the type is `multiple-values`, `values` is not empty, and `open` is absent.

The info button is `type="button"`, `tabindex="-1"`, name `additional information`. `mousedown` calls `preventDefault`. While the pointer is over it and `cc-tooltip` is on the page, the tooltip shows that phrase. A disabled plate does not show it, and hides it if it was showing. A missing tooltip is a no-op.

Chips are `demo-chip`. The label is the option label for that id, or the raw id when nothing matches. A disabled plate disables every chip. Clearing a chip is specified under Events. The chip contract (size, clear button, `demo-clear`) is the field specification's chip part.

## Value line

On `large`, `medium`, and `small`, `value` is the choice id. The plate shows the label of the matching option. If no choice matches, it shows the raw value. Empty means unfilled.

The label uses body-1 on the value line and floats to caption size when the value is non-empty, `show-placeholder` is set, or `open` is set. `medium` and `small` never float. `multiple-values` floats only while `show-label` is set, and then when there is a chip, the list is open, or `show-placeholder` is set.

While the label floats on `large`, or on an empty `multiple-values` plate, the value line stays in the stack even when it has no text (`min-height: var(--font-body-1-line)`). The caption then sits on that line instead of centering in the plate. A `multiple-values` plate that already has chips does not keep an empty value line.

Placeholder text is shown when `show-placeholder` is set and the single value is empty, or on an empty `multiple-values` plate. `small` never shows it.

## Paint

| State | What changes |
| --- | --- |
| `default` | Fill `--color-surface-neutral-transparent-default`. Hover uses `--color-surface-neutral-transparent-hover` only while `open` is absent. |
| `error` | Danger label, danger hint, indicator `--color-border-danger-default`. The plate fill stays the transparent default. `open` does not restyle this into accent. `small` keeps the default plate and still draws the value. Hover on a closed error `small` still uses the neutral hover fill. |
| `disabled` | Fill `--color-surface-neutral-transparent-disabled`. Placeholder `--color-text-core-disabled`. A shown value `--color-text-core-tertiary`. Icon, trail, and caret `--color-icon-shape-core-disabled`. The plate ignores the pointer and dispatches nothing. |

| `open` on | What you see |
| --- | --- |
| `large`, `medium`, `multiple-values`, state `default` | Label `--color-text-accent-default`. Bottom indicator `--color-border-accent-solid`, height `--stroke-2`. |
| `small`, state `default` or `error` | Fill `--color-surface-neutral-transparent-active`. No indicator and no label. |

The indicator is drawn for `open` on a non-small, non-disabled plate, and for `error` on a non-small plate. A quiet default plate has none. `disabled` wins over `open`: if both would apply, the field removes `open`.

Value text is `--color-text-core-primary` on default, open, and error. Placeholder is `--color-text-core-tertiary`. On an open `large` or open empty `multiple-values` plate, placeholder is `--color-text-core-disabled`. An open `medium` placeholder stays tertiary. A disabled placeholder is disabled text. The resting label is `--color-text-core-secondary`. The hint is `--color-text-core-tertiary` unless the state is `error`. The icon is `--color-icon-shape-core-default`.

## Opening and closing

A click on the plate toggles `open`. The click includes a chip and the Add button. It excludes `.demo-chip__clear` and `.cc-select__info`. Source is `add` when the target is inside Add, otherwise `plate`. The field dispatches bubbling `cc-toggle` with `{ source }` after the attribute flips. A disabled plate returns before any of this.

Setting `open` ensures one `cc-dropdown-menu`, fills it, moves it to `document.body`, sets the menu's `open`, and calls `place` with the plate element. Removing `open` removes it from the menu and moves the menu back under the host. Disconnecting the select hides the tip, unbinds dismiss, and clears the menu's `open`.

While open, a capture-phase `pointerdown` whose `composedPath` includes neither the select nor the menu clears `open`. A `pointerdown` on the menu does not count as outside. `Escape` clears `open` and calls `preventDefault`. Both listeners are removed when the list closes.

`disabled` clears `open` whenever `state` or `open` changes into that combination, and on connect. A disabled select does not open.

## Menu rows

| Select `type` | Row |
| --- | --- |
| `small` | `cc-dropdown-action-item` with `size="small"`. |
| `large`, `medium` | `cc-select-option`. `selected` while the row value equals the select `value`. |
| `multiple-values` | `cc-checkbox-option`. `selected` while `values` includes that id. |
| `{ kind: "group" }` | `cc-option-group` with that label. A group is not a choice and does not dispatch a pick. |

Each choice row gets `label` and `value`.

On `large` and `medium`, while `show-placeholder` is set, the menu starts with one extra row: label `Nothing selected`, value `""`, `data-empty`. It is `selected` while the plate value is empty. Choosing it writes `value=""` and closes the list. `small` and `multiple-values` do not get this row. A stored choice whose value is already `""` is not repeated under it.

Changing `type` or `show-placeholder` rebuilds the rows. Changing `value` updates `selected` on the single-choice rows without a rebuild. Changing `values` updates `selected` on the checkbox rows.

## Picking

The menu listens for bubbling `cc-pick`.

On `small`, `large`, and `medium` the field writes `value` from `detail.value` (`""` when nullish), dispatches bubbling `cc-change` with `{ value }`, and clears `open`.

On `multiple-values` the field reads every `cc-checkbox-option` that has `selected` after the row has toggled itself, replaces `values` with those ids in DOM order, repaints, and dispatches `cc-change` with `{ values }` (a copy). The list stays open.

A chip clear on `multiple-values` removes that index, repaints, syncs the checkbox `selected` flags, and dispatches `cc-change` with the remaining ids. It does not dispatch `cc-toggle` and it does not close the list. An index outside the list is ignored. A disabled plate ignores the pick and the clear.

## Events

| Event | When | `detail` |
| --- | --- | --- |
| `cc-toggle` | Plate, chip, or Add toggles `open`. Bubbles. | `{ source: "plate" }` or `{ source: "add" }` |
| `cc-change` | A single choice is picked. The list closes. | `{ value }` |
| `cc-change` | A checkbox row is picked. The list stays open. | `{ values }` copy |
| `cc-change` | A chip clear removes an id. The list stays open. | `{ values }` copy |

Setting `options` or `values` from script does not dispatch `cc-change`.

## Dropdown menu

`cc-dropdown-menu` is the list panel. `role` is `listbox`. `open` is a boolean attribute and a reflected property. Without `open` the menu is `hidden` and `inert`, and it drops its frame listeners. With `open` it is shown.

Chrome: `position: fixed`, `z-index: 8`, padding block `--spacing-8`, no inline padding, `overflow-x: hidden`, `overflow-y: auto`, border `--stroke-1` `--color-border-core-subtle`, radius `--radius-8`, fill `--color-surface-core-top`, shadow `--shadow-6`.

`place(anchor)` stores the anchor and positions the menu. It no-ops unless the menu is connected and open.

1. Width is the anchor's `offsetWidth`, clamped to the viewport width.
2. Content height is `scrollHeight` plus the border box minus the client box.
3. Gap is the numeric value of `--spacing-2` (0 when the token is missing).
4. Room below is `viewport height − anchor bottom − gap`, floored at 0. Room above is `anchor top − gap`, floored at 0.
5. If the content height fits below, the top is `anchor bottom + gap` and `data-flip` is removed.
6. Otherwise, if it fits above, the top is `anchor top − gap − height` and `data-flip` is set.
7. If it fits on neither side, the menu stays on the larger side. Equal rooms stay below. `max-height` is that room, so the panel meets the viewport edge and the rows scroll inside. The gap to the anchor stays `--spacing-2`.
8. The left edge starts at the anchor's left. If the panel would pass the right edge, it shifts left. If it would pass the left edge, it sits at 0.

While open, the menu re-places on window `resize`, on `scroll` of the anchor and every ancestor and `window`, and on a `ResizeObserver` of the anchor. A scroll whose target is the menu itself does not re-place, so scrolling the list does not reset it. A `requestAnimationFrame` loop also re-places, and it skips the write when the anchor rect, the viewport, and the content height are unchanged. That is what keeps the panel on the plate when the page scrolls without a scroll event, and when a chip row grows. Closing or disconnecting cancels the loop and the listeners.

## Option rows

All four elements ignore a host inside `[data-ghost]`.

`cc-select-option` renders a button. A leading cell of `--spacing-40` holds a check icon of `--layout-icon-size`, visible only while `selected` is set. The label is one line, ellipsis. Click, unless `disabled`, bubbles `cc-pick` with `{ value, label, selected: true }`. The row does not write `value` onto the select. Disabled text is `--color-text-core-disabled`.

`cc-dropdown-action-item` is the same button without a check. `size="small"` sets the row height to `--layout-select-option-height`, body-2, and inline start `--spacing-8` plus `--spacing-4`. Click bubbles `cc-pick` with `{ value, label }`.

`cc-checkbox-option` toggles its own `selected` on click, then bubbles `cc-pick` with `{ value, label, selected }` for the new state. The box is `--spacing-16`, radius `--radius-4`, border `--stroke-1` `--color-border-core-subtle`. Selected fill is `--color-surface-accent-solid-default` and the tick is `--color-icon-shape-core-on-solid`. The tick is hidden while `selected` is absent.

`cc-option-group` is not a button. `role` is `presentation`. The label is overline, uppercase, `--color-text-core-tertiary`. A group that is not the first child has `--spacing-24` of space above it.

Every choice row is at least `--spacing-40` tall except the small action item. Hover and `:focus-visible` paint `--color-surface-neutral-transparent-hover` behind the row. Focus outline is none. `data-empty` paints the row in `--color-text-core-tertiary`.
