---
title: Select Usage
description: When to choose a select type and what the plate events mean
tags: [select, usage, demo]
audience: human
scope: reference
updated: 2026-11-25
---

# Usage

Use `cc-select` when the person picks from a list. The plate toggles `open` and shows its own `cc-dropdown-menu`.

## Type

| Type | When |
| --- | --- |
| `large` | One choice, and the label belongs on the plate. The label floats. |
| `medium` | One line, and something around the plate already names the value. No label. |
| `small` | A state or a tab switch. The current option is always visible. There is no empty state, and no error, hint, placeholder, or label. Width stops at `--layout-select-max-width`. |
| `multiple-values` | Several chips. Add and the plate both toggle the list. Clearing a chip removes that value immediately and leaves the list open. |

## State

The playground state switch is `default`, `error`, or `disabled`. `open` is separate: it means the live list is open, and the plate paints the open chrome. `error` may stay open. `disabled` clears `open`.

`small` has no error chrome. `error` on `small` still looks like the default small plate.

## Extras

| Extra | When |
| --- | --- |
| Hint | Helper text under the plate. Hidden while the switch is off. Not on `small`. |
| Placeholder | Sample text in an empty plate. A chosen value does not belong here. Not on `small`. On `large` and `medium`, the open list then starts with a gray `Nothing selected` row that clears the choice. |
| Icon | A leading modules glyph. |
| Trailing button | Side action. Hover says `additional information`. |
| Required | A star after the label. Hidden when the plate has no label. |
| Label | On `multiple-values`, the caption above the chips. Off leaves the chips in the 56 plate until they wrap. `large` always shows its label. |

## Events

A plate click or Add toggles `open` and bubbles `cc-toggle`. `detail.source` is `plate` or `add`. A chip clear and the info button do not toggle.

`cc-change` bubbles when the selection changes. On `large`, `medium`, and `small`, `detail.value` is the chosen id, the plate shows the matching label (or the raw value when nothing matches), and the list closes. On `multiple-values`, `detail.values` is a copy of the ids, each chip shows the matching label, and the list stays open after a pick or a chip clear.

Setting `options` or `values` does not send `cc-change`. Put a new single choice back through the `value` attribute, or put the same id list back through the `values` property, if something else changes the selection.
