---
title: Icon Button
description: Axes, sizes, and states of the icon button
tags: [button, demo]
audience: human
scope: reference
updated: 2026-11-24
figma: "...figma.com/no-access"
---

# Icon button

A button with a grid glyph and no visible label.

## Axes

| Axis | Values |
| --- | --- |
| size | `large` · `medium` · `small` |
| color | `brand-blue` · `brand-cyan` · `neutral` · `danger` · `success` · `warning` · `info` |
| style | `solid` · `faded` · `transparent` · `no-surface` · `outline` |

`neutral` has no `solid`. Switching to `neutral` from `solid` sets the style to `faded`. The glyph is always shown.

## Size

| Size | Box |
| --- | --- |
| large | 48 px circle |
| medium | 36 px |
| small | 24 px |

## Badge

One badge sits at the top end, outside the box. Its color is any color from the list above.

Large shows the count `1`. Medium and small show the dot: no digit, a 10 px mark. A `surface/core/undertone` disk sits behind the count and behind the dot, 4 px wider in diameter. On small the badge sits 2 px higher and 2 px further toward the end than on medium. The glyph stays on; this screen has no icon switch for an icon button.

## Pointer

Hover and pressed follow the pointer. The tooltip reads `hover` or `pressed` and sits `--spacing-2` plus 2 px from the button. Disabled paints the quiet state and ignores the pointer. Focus is not drawn.

## Paint

| Style | Rest and disabled | Hover and pressed |
| --- | --- | --- |
| solid | Filled | Filled |
| faded | Translucent fill | Translucent fill |
| transparent | Weaker translucent fill | Weaker translucent fill |
| no-surface | No fill | Same as `transparent` |
| outline | No fill, plus a border | Same as `transparent`, plus a border |
