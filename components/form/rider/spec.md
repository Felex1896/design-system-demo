---
title: Rider Spec
description: Requirements for the stage rider form
tags: [form, rider, spec]
audience: both
scope: reference
updated: 2026-11-25
---

# Rider

File the stage rider for an event. The form opens empty. Template `rider`.

## Stage

| Field | Control | Rule |
| --- | --- | --- |
| Description | `field-text-area` | Required. |

## Equipment

| Field | Control | Rule |
| --- | --- | --- |
| Equipment | `field-with-chips` | Label on. Hint `Press Enter to add a value`. Not required. An empty list does not block Create. |

## Contact

| Field | Control | Rule |
| --- | --- | --- |
| Tour contact | `field-standard` | One line. |

## Actions

| Action | Look | Rule |
| --- | --- | --- |
| Create | accent, solid | Required check. Description is the only required field. |
