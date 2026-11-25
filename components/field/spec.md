---
title: Field
description: Sets, states, and the live sample of the field
tags: [field, demo]
audience: human
scope: reference
updated: 2026-11-24
figma: "...figma.com/no-access"
---

# Field

A text input. Four sets share one plate. `custom-text-size` is not in this playground.

## Sets

| Set | What it shows |
| --- | --- |
| `standard` | One line and a floating label. The plate is 56 px tall. |
| `medium` | One line and no label. The plate is 40 px tall. The sample text starts on. |
| `text-area` | Several lines. The plate is 160 px tall. While quiet, the label sits in the top 56 px. Extra lines scroll, with the scrollbar on the field's right edge. The text keeps `--spacing-12` before the field's right edge, and the same `--spacing-12` before the trailing button. |
| `multiple-values` | Chips plus a text entry. An empty plate is 56 px. A label and one chip make it 72 px. Without a label, one chip stays in 56 px. The plate stops at 160 px, then only the chips scroll. The label stays put. The scrollbar sits on the field's right edge. |

Color stays `neutral`. Style stays `transparent`. The sample is at most 536 px wide.

## State

| State | What you see |
| --- | --- |
| default | Quiet plate. Hover follows the pointer. |
| selected | Accent label and an accent bar along the bottom. This is the active field. There is no focus ring. |
| error | Danger label, danger hint, and a danger bar. You can still type. Hover does not restyle it. |
| disabled | Quiet and inactive. Placeholder uses the disabled text color. Typed text uses tertiary. |

Clicking a quiet field makes it selected. Clicking outside returns it to default. An error stays an error while you type. A disabled field ignores the pointer.

The label floats when the field is selected, when it has text, or when the sample text is on. It sits flush against the entry. `medium` has no label.

## Sample copy

The words stay `Label`, `Placeholder`, `Tell me a story`, and `Km`. The field starts empty. What you type becomes the value.

## Chips

A chip is the labeled chip, variant `transparent`: the word and a clear control. The chip is 32 px tall. The clear control is a 24 px target around a 16 px glyph. Enter, or leaving the field, wraps the whole entry into one chip and clears the entry. An empty entry does nothing. The clear control removes that chip and leaves an unfinished entry in place. The same word can become two chips. The entry stays hidden until the field is active, the placeholder is on, or a chip is already there. A click opens that entry the same way as the other sets. There is no gap between the floating label and that row. Backspace in an empty entry marks the last chip with the focus ring. The next Backspace removes it. Typing or leaving the field clears the mark.
