---
title: Icon Button
description: Development specification of the icon button
tags: [button, demo, spec]
audience: both
scope: reference
updated: 2026-11-25
---

# Icon button

`demo-button[kind="icon-button"]` is a round button with a modules glyph and no visible label. It is the same element as the labeled button. Paint slots, badge color, the disabled rule, the ghost rule, and the pointer tooltip are specified here in full.

A host that places the button inside `[data-ghost]` gets an inert element: it does not mount a control and does not participate in the tooltip.

The button does not resolve brand colors. The host writes the paint slots. `neutral` has no `solid` surface. If the requested pair is `neutral` + `solid`, the host substitutes `faded` before painting. The button itself does not coerce the pair.

## Attributes

| Attribute | Values | Default | Effect |
| --- | --- | --- | --- |
| `kind` | `icon-button` | — | This kind. The glyph is always shown. `show-icon` does not hide it. |
| `size` | `large`, `medium`, `small` | `large` when absent | Box and badge. |
| `label` | text | `Label` | Accessible name on the inner button (`aria-label`). Not visible. |
| `show-badge` | presence | absent | Badge at the top end, outside the box. |
| `disabled` | presence | absent | Quiet paint. The inner button is disabled. |

`color`, `style`, and badge color are not attributes. They arrive as the paint slots.

## Box

The host is `inline-flex`. The inner control is `type="button"`, a circle (`border-radius: var(--radius-pill)`). The visible label is `display: none`. The glyph is centered, with no extra margin. Focus draws nothing.

| Size | Box | Padding | Glyph |
| --- | --- | --- | --- |
| `large` | `--spacing-48` | `12px` | `--spacing-24` |
| `medium` | `--layout-icon-button-size` | `--spacing-6` | `--spacing-24` |
| `small` | `--spacing-24` | `--spacing-4` | `--spacing-16` |

Type on the host is subtitle-3. It is not visible. The accessible name is the `label` attribute.

## Badge

Same badge as the labeled button, including the undertone plate.

| Size | Mark | Position from the top end corner |
| --- | --- | --- |
| `large` | Count `1`. Min width and height `--spacing-24`. Padding inline `--spacing-8`. Caption-medium. | `--spacing-4` × 1.5 outside the top and the end. |
| `medium` | Dot, `10px`, no digit. | `--spacing-4` outside the top and the end. |
| `small` | Same dot. | `--spacing-4` plus `--spacing-2` outside the top and the end. |

The plate is `surface/core/undertone` and pads the mark by half of `--spacing-4` on every side. Badge colors:

| Badge color | Fill | Ink | Dot |
| --- | --- | --- | --- |
| `neutral` | `surface/neutral/faded/default` | `text/core/primary` | `icon-shape/core/disabled` |
| any other | `surface/<color>/solid/default` | `text/core/on-solid` | `icon-shape/<color>/default` |

## Paint slots

The host sets these on the element. Rest, hover, and pressed share one ink and one icon color. The border is an inset `box-shadow` of `--stroke-1`.

| Slot | Used for |
| --- | --- |
| `--demo-fill`, `--demo-fill-hover`, `--demo-fill-pressed`, `--demo-fill-disabled` | Background. |
| `--demo-ink`, `--demo-ink-hover`, `--demo-ink-pressed`, `--demo-ink-disabled` | Unused visually. The name is `aria-label`. |
| `--demo-icon`, `--demo-icon-hover`, `--demo-icon-pressed`, `--demo-icon-disabled` | Glyph. |
| `--demo-border` and the hover, pressed, and disabled twins | Inset stroke. |
| `--demo-badge-plate`, `--demo-badge-fill`, `--demo-badge-ink`, `--demo-badge-dot` | Badge. |

| Style | Fill | Disabled fill | Hover / pressed fill |
| --- | --- | --- | --- |
| `solid`, `faded`, `transparent` | `surface/<color>/<style>/default` | `surface/<color>/<style>/disabled` | `surface/<color>/<style>/hover` and `.../active` |
| `no-surface` | transparent | transparent | `surface/<color>/transparent/hover` and `.../active` |
| `outline` | transparent | transparent | same as `no-surface` |

| Style | Icon | Disabled icon | Border |
| --- | --- | --- | --- |
| `solid` | `icon-shape/core/on-solid` | `icon-shape/core/disabled` | transparent |
| `faded` | `icon-shape/core/default` | `icon-shape/core/disabled` | transparent |
| `transparent`, `no-surface`, `outline`, color not `neutral` | `icon-shape/<color>/default` | `icon-shape/<color>/disabled` | transparent, except `outline` |
| same three, color `neutral` | `icon-shape/core/default` | `icon-shape/core/disabled` | transparent, except `outline` |
| `outline` | as the row above | as the row above | `border/<color>/default` at rest, hover, and pressed; `border/<color>/disabled` when disabled |

Hover and pressed apply only while `disabled` is absent. A disabled button uses the disabled slots on rest, hover, and active, cursor `default`, and blurs itself if it had focus.

## Pointer tooltip

One page-level tooltip is shared by every `demo-button`. It is `position: fixed`, `z-index: 7`, `pointer-events: none`. Fill `--color-surface-core-inverse-strong`, ink `--color-text-core-inverse`, type body-2, padding `--spacing-8`, radius `--radius-4`. Max width is the smaller of `--layout-tooltip-max` and the viewport minus `--spacing-32`.

The anchor is the layout box, centered in the visual rect. The gap is `--spacing-2` plus `2px`. The tip stays inside the viewport horizontally.

1. Mouse `pointerenter` shows `hover`, unless the button is disabled or a touch ended within the last 700 ms.
2. Primary `pointerdown`, or a touch or pen `pointerdown`, shows `pressed`.
3. Mouse `pointerup` returns to `hover` while the pointer is still over the button.
4. Touch or pen `pointerup` and `pointercancel` hide the tip and open the 700 ms quiet window. A touch `pointermove` that leaves the button hides the tip.
5. `pointerleave`, capture-phase document scroll, disconnect, and `disabled` hide the tip.

Placement prefers under the button, and moves above when it does not fit. On a root with `is-stacked`, placement prefers above, and moves under only when above does not fit.
