---
title: Booking Spec
description: Requirements for the event booking form
tags: [form, booking, spec]
audience: both
scope: reference
updated: 2026-11-25
---

# Booking

Create a booking. The form opens empty. Template `booking`.

## When

The day of the event and the time it starts.

| Field | Control | Rule |
| --- | --- | --- |
| Date | `field-standard` | Calendar glyph. Mask `DD.MM.YYYY`. Same row as Start. Not required. A partial mask does not block Create. |
| Start | `field-standard` | Clock glyph. Mask `HH:MM`. Not required. |

## Event

| Field | Control | Rule |
| --- | --- | --- |
| Event name | `field-standard` | Required. |
| Guest count | `field-standard` | Digits. Suffix `guests`. Placeholder `120`. Minimum 1. Maximum 2000. Empty is allowed. |

## Place

| Field | Control | Rule |
| --- | --- | --- |
| Room | `select` `large` | Optional. One of Hall A, Hall B, Hall C. Placeholder `Not selected`, and that row is first in the list. Choosing it clears Room. |

## Actions

| Action | Look | Rule |
| --- | --- | --- |
| Create | accent, solid | Required check. Event name is the only required field. A guest count outside 1–2000 blocks Create after the name is filled. |
