---
title: Seating Spec
description: Requirements for the seating form
tags: [form, seating, spec]
audience: both
scope: reference
updated: 2026-11-25
---

# Seating

Set the room layout. The form opens empty. Template `seating`. One section, no title.

How many tables to set, how many seats at each, and how to arrange them.

## Fields

| Field | Control | Rule |
| --- | --- | --- |
| Number of tables | `field-standard` | Required. Digits. Placeholder `12`. Minimum 1. Maximum 80. Same row as Seats per table. |
| Seats per table | `field-standard` | Digits. Placeholder `8`. Minimum 1. Maximum 16. Empty is allowed. |
| Seating layout | `select` `large` | Optional. One of Banquet, Theater, Classroom. Placeholder `Not selected` is the first row and clears the layout. The control opens with nothing selected. |

## Actions

| Action | Look | Rule |
| --- | --- | --- |
| Create | accent, solid | Required check. Number of tables is the only required field. Tables use 1–80 and seats use 1–16. |
