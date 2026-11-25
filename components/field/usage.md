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
| Hint | Helper text under the plate. The slot can be on while the text is empty. A chip field that takes typed values says to press Enter. |
| Placeholder | Sample text in an empty field. A real value, or a rule about what is valid, does not belong here. A field with no visible label always shows one. The label says what to enter. The placeholder says the format or shows an example. |
| Date or time mask | The pattern (`DD.MM.YYYY`, `HH:MM`, and the Russian letters) is drawn in the placeholder color. Characters the person has typed are primary. A date mask also opens a calendar. A time mask opens a list from `00:00` to `23:45`, every 15 minutes. |
| Icon | A leading glyph. `date` is the calendar. `time` is the clock. |
| Suffix | The unit of the value, such as `Km`. Not a copy of the label. Not on the text area or `multiple-values`. |
| Trailing button | A side action, the same pill button as menu and close. Hover says `additional information`. |
| Required | A star after the label. Hidden when the field has no label. |

## Chips

Press Enter, or leave the field, to turn the entry into a chip. The clear control removes one chip. Suggestions while typing are not part of this playground.
