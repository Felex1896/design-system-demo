---
title: Staff Access Spec
description: Requirements for the staff access form
tags: [form, staff, spec]
audience: both
scope: reference
updated: 2026-11-25
---

# Staff access

Create a staff login. The form opens empty. Template `staff`. One section, no title.

## Fields

| Field | Control | Rule |
| --- | --- | --- |
| Login | `field-standard` | Required. Same row as Password. |
| Password | `field-standard` | Required. The value is masked. The trailing control shows and hides it without changing the text. |
| Role | `select` `large` | Optional. One of Manager, Technician, Host. Placeholder `Not selected` is the first row and clears Role. |

## Actions

| Action | Look | Rule |
| --- | --- | --- |
| Create | accent, solid | Required check. Login and Password are both required. An empty Role does not block Create. |
