---
title: Labeled Button
description: Development specification of the labeled button
tags: [button, demo, spec]
audience: both
scope: reference
updated: 2026-11-25
---

# Labeled button

`demo-button` without `kind="icon-button"` is a pill button with a visible label. The icon-button kind is a separate specification on the same element. A host that places the button inside `[data-ghost]` gets an inert element: it does not mount a control and does not participate in the tooltip.

The button does not resolve brand colors. The host writes the paint slots below. `neutral` has no `solid` surface. If the requested pair is `neutral` + `solid`, the host substitutes `faded` before painting. The button itself does not coerce the pair.

## Attributes

| Attribute | Values | Default | Effect |
| --- | --- | --- | --- |
| `kind` | absent, or anything other than `icon-button` | absent | Labeled button. |
| `size` | `large`, `medium`, `small` | `large` when absent | Box, type, badge. |
| `label` | text | `Label` | Visible label. |
| `show-icon` | presence | absent | Leading modules glyph. |
| `show-badge` | presence | absent | Badge at the top end, outside the box. |
| `disabled` | presence | absent | Quiet paint. The inner button is disabled. |

`color`, `style`, and badge color are not attributes. They arrive as the paint slots.

## Box

The host is `inline-flex`, `max-width: 100%`. The inner control is `type="button"`. Radius is pill. White-space is nowrap. Focus draws nothing: `outline` is none on the control, including `:focus-visible`.

| Size | Height | Min width | Padding inline | Label padding inline | Type |
| --- | --- | --- | --- | --- | --- |
| `large` | `--spacing-56` | `80px` | `--spacing-16` | `--spacing-8` | button |
| `medium` | `--spacing-40` | `80px` | `12px` | `--spacing-4` | button |
| `small` | `--spacing-32` | `--spacing-64` | `12px` | `--spacing-4` | button-small |

The glyph is `--spacing-24`. On large and medium it has `--spacing-4` of space before the label. On small the space is a negative `--spacing-4` on the start side. The glyph is hidden unless `show-icon` is set.

## Badge

One badge, `pointer-events: none`, drawn only while `show-badge` is set. It sits outside the box at the top end. A `--color-surface-core-undertone` plate (`--demo-badge-plate`) pads the mark by half of `--spacing-4` on every side, so the plate is `--spacing-4` wider than the mark.

| Size | Mark | Position from the top end corner |
| --- | --- | --- |
| `large` | Count `1`. Min width and height `--spacing-24`. Padding inline `--spacing-8`. Caption-medium. Fill `--demo-badge-fill`, ink `--demo-badge-ink`. | `--spacing-4` × 1.5 outside the top and the end. |
| `medium` | Dot, no digit. `10px` square. The mark fill is the undertone plate, and a linear gradient of `--demo-badge-dot` paints the dot. | `--spacing-4` outside the top and the end. |
| `small` | Same dot as medium. | `--spacing-4` plus `--spacing-2` outside the top and the end. |

Badge color is a host choice: `accent`, `neutral`, `danger`, `success`, `warning`, `info`.

| Badge color | Fill | Ink | Dot |
| --- | --- | --- | --- |
| `neutral` | `surface/neutral/faded/default` | `text/core/primary` | `icon-shape/core/disabled` |
| any other | `surface/<color>/solid/default` | `text/core/on-solid` | `icon-shape/<color>/default` |

The undertone plate is `surface/core/undertone` for every badge color.

## Paint slots

The host sets these on the element. Rest, hover, and pressed share one ink and one icon color. Only disabled ink and disabled icon change. The border is an inset `box-shadow` of `--stroke-1`, not a CSS border, so the box size does not change.

| Slot | Used for |
| --- | --- |
| `--demo-fill` | Rest background. |
| `--demo-fill-hover` | Hover background. |
| `--demo-fill-pressed` | Pressed background. |
| `--demo-fill-disabled` | Disabled background, including hover and active. |
| `--demo-ink`, `--demo-ink-hover`, `--demo-ink-pressed` | Label. The three are the same color. |
| `--demo-ink-disabled` | Disabled label. |
| `--demo-icon`, `--demo-icon-hover`, `--demo-icon-pressed` | Glyph. The three are the same color. |
| `--demo-icon-disabled` | Disabled glyph. |
| `--demo-border` and the hover, pressed, and disabled twins | Inset stroke. |
| `--demo-badge-plate`, `--demo-badge-fill`, `--demo-badge-ink`, `--demo-badge-dot` | Badge. |

`<color>` is the button color. `<style>` is `solid`, `faded`, or `transparent`.

| Style | Fill | Disabled fill | Hover / pressed fill |
| --- | --- | --- | --- |
| `solid`, `faded`, `transparent` | `surface/<color>/<style>/default` | `surface/<color>/<style>/disabled` | `surface/<color>/<style>/hover` and `.../active` |
| `no-surface` | transparent | transparent | `surface/<color>/transparent/hover` and `.../active` |
| `outline` | transparent | transparent | same as `no-surface` |

| Style | Ink and icon | Disabled ink and icon | Border |
| --- | --- | --- | --- |
| `solid` | `text/core/on-solid`, `icon-shape/core/on-solid` | `text/core/disabled`, `icon-shape/core/disabled` | transparent |
| `faded` | `text/core/primary`, `icon-shape/core/default` | `text/core/disabled`, `icon-shape/core/disabled` | transparent |
| `transparent`, `no-surface`, `outline`, color not `neutral` | `text/<color>/default`, `icon-shape/<color>/default` | `text/<color>/disabled`, `icon-shape/<color>/disabled` | transparent, except `outline` |
| `transparent`, `no-surface`, `outline`, color `neutral` | `text/core/primary`, `icon-shape/core/default` | `text/core/disabled`, `icon-shape/core/disabled` | transparent, except `outline` |
| `outline` | as the row above | as the row above | `border/<color>/default` at rest, hover, and pressed; `border/<color>/disabled` when disabled |

Hover and pressed rules apply only while `disabled` is absent. A disabled button uses the disabled slots on rest, hover, and active, and its cursor is `default`.

## Pointer tooltip

One page-level tooltip is shared by every `demo-button`. It is not `cc-tooltip`. It is `position: fixed`, `z-index: 7`, `pointer-events: none`, `width: max-content`, max width the smaller of `--layout-tooltip-max` and the viewport minus `--spacing-32`. Padding `--spacing-8`, radius `--radius-4`, fill `--color-surface-core-inverse-strong`, ink `--color-text-core-inverse`, type body-2.

The anchor is the button's layout box (`offsetWidth` / `offsetHeight`), centered inside the visual rect, so a transform does not move the tip. The gap is `--spacing-2` plus `2px`. Horizontal position centers on that box, then shifts so the tip stays inside the viewport.

1. Mouse `pointerenter` shows `hover`, unless the button is disabled or a touch just ended (the quiet window below).
2. Primary `pointerdown`, and a touch or pen `pointerdown`, shows `pressed`. A non-primary mouse button does nothing.
3. Mouse `pointerup` returns to `hover` while the pointer is still over the button. Otherwise it hides.
4. Touch or pen `pointerup`, `pointercancel`, and a document-level touch `pointerup` or `pointercancel` hide the tip and ignore mouse `pointerenter` for 700 ms. A touch `pointermove` hides the tip once the point leaves the button.
5. `pointerleave` hides the tip when this button is the anchor.
6. A capture-phase scroll on `document` hides the tip.
7. Disconnecting the anchor, or setting `disabled` while it is the anchor, hides the tip. Setting `disabled` also blurs the inner button if it has focus.

Placement prefers under the button. If the tip does not fit under it, the tip moves above. On a page whose root has `is-stacked`, the preference flips: above when it fits, otherwise under.
