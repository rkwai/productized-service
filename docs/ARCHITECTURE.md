# Architecture

## Overview
The dashboard is a static, dependency-free SPA that loads the ontology and FDE findings from `data.js`, renders a value-focused summary, and provides editable forms for every field.

## Key files
- `index.html`: Layout and semantic sections.
- `styles.css`: Layout and visual styling.
- `data.js`: Canonical dataset seed.
- `app.js`: Rendering engine and state management.

## State model
- `initialData` is a deep clone of the JSON payload.
- `state` is the mutable data object.
- `setValue(path, value)` updates state based on a path array.
- UI re-renders after each change.

## Rendering strategy
- Primitive fields render as inputs (text, number, checkbox).
- Arrays of primitives render as newline-delimited textareas.
- Arrays of objects render as cards with add/remove controls.

## Business value focus
The header calls out the primary objective and rapid prototype timeline. Summary tiles show counts of delivery/governance artifacts to keep attention on outcomes and renewal risks.
