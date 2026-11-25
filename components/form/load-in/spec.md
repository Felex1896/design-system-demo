---
title: Load-in Spec
description: Requirements for the load-in form
tags: [form, load-in, spec]
audience: both
scope: reference
updated: 2026-11-25
---

# Load-in

Schedule a load-in. The form opens empty. Template `load-in`.

## Window

The hours when a vehicle may arrive.

| Field | Control | Rule |
| --- | --- | --- |
| Start | `field-standard` | Required. Clock glyph. Mask `HH:MM`. Same row as End. |
| End | `field-standard` | Clock glyph. Mask `HH:MM`. Not required. The form does not check that End is after Start. |

## Vehicle

| Field | Control | Rule |
| --- | --- | --- |
| Vehicle type | `select` `large` | Optional. One of Van, Truck, Sprinter. Placeholder `Not selected` is the first row and clears the type. |

## Crew

How many people come with the vehicle.

| Field | Control | Rule |
| --- | --- | --- |
| Number of people | `field-standard` | Digits. Suffix `people`. Placeholder `6`. Minimum 1. Maximum 40. Empty is allowed. |

## Actions

| Action | Look | Rule |
| --- | --- | --- |
| Create | accent, solid | Required check. Start is the only required field. A crew count outside 1–40 blocks Create after Start is filled. |
