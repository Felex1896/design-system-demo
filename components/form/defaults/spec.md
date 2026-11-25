---
title: Hall Defaults Spec
description: Requirements for the hall defaults form
tags: [form, defaults, spec]
audience: both
scope: reference
updated: 2026-11-25
---

# Hall defaults

Edit the saved hall defaults. Template `defaults`. This is an editing form. Nothing is required.

The form opens with the saved values. Set default writes a different preset and does not replace that baseline. Reset returns to the saved values. Apply leaves the current values in place, so it stays available until the form matches the saved values again.

## Opens with

| Field | Value |
| --- | --- |
| Buffer | `45` |
| Default room | Hall B |
| Event types | Conference |

## Preset

| Field | Value |
| --- | --- |
| Buffer | `30` |
| Default room | Hall A |
| Event types | Concert |

## Hours

How long the hall stays empty between events.

| Field | Control | Rule |
| --- | --- | --- |
| Buffer | `field-standard` | Digits. Suffix `min`. Minimum 0. Maximum 240. `0` is a value. Empty is allowed. |

## Room

| Field | Control | Rule |
| --- | --- | --- |
| Default room | `select` `large` | Optional. One of Hall A, Hall B, Hall C. Placeholder `Not selected` is the first row and clears the room. Clearing it makes the form differ from Hall B. |

## Events

| Field | Control | Rule |
| --- | --- | --- |
| Event types | `select` `multiple-values` | Label on. Several of Concert, Conference, Wedding, Rehearsal. Hint `You can select several`. A chip or an uncheck removes that type. There is no `Not selected` row. The order of the chosen values is part of the difference from the opening list. |

## Actions

Footer order is leading to trailing. None of these run the required check, so a buffer outside 0–240 shows its hint and does not block Apply, Reset, or Set default.

| Action | Look | Rule |
| --- | --- | --- |
| Set default | neutral, outline | Always. Writes the preset into Buffer, Default room, and Event types. |
| Reset | neutral, no-surface | Enables when any control differs from the opening values. Writes those values back. |
| Apply | accent, solid | Enables on that same difference. A click does not make the current values the new baseline. |
