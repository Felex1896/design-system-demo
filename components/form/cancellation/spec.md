---
title: Cancellation Spec
description: Requirements for the event cancellation form
tags: [form, cancellation, spec]
audience: both
scope: reference
updated: 2026-11-25
---

# Cancellation

Cancel an event by recording a reason, or leave without deleting. The form opens empty. Template `cancellation`. One section, no title.

## Fields

| Field | Control | Rule |
| --- | --- | --- |
| Reason | `field-text-area` | Required for Delete. Cancel does not require it. |

## Actions

Footer order is leading to trailing. `Delete` is the label this spec adds to the closed set.

| Action | Look | Rule |
| --- | --- | --- |
| Cancel | neutral, no-surface | Always. Clears Reason. Does not run the required check. |
| Delete | danger, solid | Required check. Reason must be filled. A passing click does not clear Reason. |
