---
title: Curfew Spec
description: Requirements for the noise curfew form
tags: [form, curfew, spec]
audience: both
scope: reference
updated: 2026-11-25
---

# Curfew

Set the noise curfew for an event. The form opens empty. Template `curfew`. One section, no title.

When the hall must be quiet, and how loud it may be until then.

## Fields

| Field | Control | Rule |
| --- | --- | --- |
| Curfew time | `field-standard` | Required. Clock glyph. Mask `HH:MM`. |
| Noise level | `field-standard` | Digits. Suffix `dB`. Placeholder `85`. From 30 to 120. |
| Note | `field-text-area` | |

## Actions

| Action | Look | Rule |
| --- | --- | --- |
| Create | accent, solid | Required check. Curfew time is the only required field. |
