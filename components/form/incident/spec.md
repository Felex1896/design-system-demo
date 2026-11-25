---
title: Incident Spec
description: Requirements for the incident report form
tags: [form, incident, spec]
audience: both
scope: reference
updated: 2026-11-25
---

# Incident

Report an incident. The form opens empty. Template `incident`.

## Report

| Field | Control | Rule |
| --- | --- | --- |
| Priority | `select` `large` | Required. One of Minor, Medium, High, Major. The leading glyph matches the choice: neutral, accent, warning, danger. Nothing chosen shows no glyph. No `Not selected` row. |
| Description | `field-text-area` | Required. |

## People

The contact stays off until someone was hurt.

| Field | Control | Rule |
| --- | --- | --- |
| Anyone hurt | `select` `large` | Required. One of No or Yes. No `Not selected` row. |
| Contact | `field-standard` | Disabled until Anyone hurt is Yes. Trailing dependency glyph. Hover says `Depends on Anyone hurt`. Switching to No disables Contact and keeps the typed text. Create ignores Contact while it is disabled. Contact is not required when it is on. |

## Follow-up

Where the report stands after you send it.

| Field | Control | Rule |
| --- | --- | --- |
| Status | `select` `large` | Optional. One of Open, Watching, Closed. Each choice is a `--spacing-12` dot inside a `--layout-icon-size` box: info, warning, success. Nothing chosen shows that dot in `icon-shape/core/disabled`. Placeholder `Not selected` is the first row and clears Status. |

## Actions

| Action | Look | Rule |
| --- | --- | --- |
| Create | accent, solid | Required check. Priority, Description, and Anyone hurt must be filled. Status may stay empty. |
