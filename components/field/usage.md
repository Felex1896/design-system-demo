---
title: Field Usage
description: When to choose a field set and which extras to turn on
tags: [field, usage, demo]
audience: human
scope: reference
updated: 2026-11-24
figma: "...figma.com/no-access"
---

# Usage

Use a field for text the person enters. Use a button when the control performs an action.

## Set

| Set | When |
| --- | --- |
| `standard` | One line, and the label belongs to the field. |
| `medium` | One short line, and the group around it already names the value. |
| `text-area` | The value runs over several lines. |
| `multiple-values` | The value is several chips, each made from what was typed. |

## Extras

| Extra | When |
| --- | --- |
| Hint | Helper text under the plate. It appears only while the switch is on. |
| Placeholder | Sample text in an empty field. A real value, or a rule about what is valid, does not belong here. |
| Icon | A leading glyph. |
| Suffix | The unit of the value, such as `Km`. Not on the text area or `multiple-values`. |
| Trailing button | A side action, the same pill button as menu and close. Hover says `additional information`. |
| Required | A star after the label. Hidden when the field has no label. |

## Chips

Press Enter, or leave the field, to turn the entry into a chip. The clear control removes one chip. Suggestions while typing are not part of this playground.
