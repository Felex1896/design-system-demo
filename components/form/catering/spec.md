---
title: Catering Spec
description: Requirements for the catering line form
tags: [form, catering, spec]
audience: both
scope: reference
updated: 2026-11-25
---

# Catering

Add one catering line, then optionally keep the service details and enter another dish. The form opens empty. Template `catering`.

## Menu

| Field | Control | Rule |
| --- | --- | --- |
| Dish | `field-standard` | Required. |
| Portion count | `field-standard` | Digits. Suffix `portions`. Placeholder `24`. Minimum 1. Maximum 500. Empty is allowed. |

## Service

| Field | Control | Rule |
| --- | --- | --- |
| Service time | `field-standard` | Clock glyph. Mask `HH:MM`. Same row as Room. Not required. |
| Room | `select` `large` | Required. One of Hall A, Hall B, Hall C. No `Not selected` row, so a choice cannot be cleared. |

## Notes

| Field | Control | Rule |
| --- | --- | --- |
| Note | `field-text-area` | Not required. |

## Actions

Footer order is leading to trailing.

| Action | Look | Rule |
| --- | --- | --- |
| Save and add | accent, no-surface | Required check. Dish and Room must both be filled. A passing click clears Dish and Portion count. Service time, Room, and Note stay, so the next line keeps the hall. |
| Add | accent, solid | Same required check. A passing click leaves every field. |
