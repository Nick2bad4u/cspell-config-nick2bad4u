# Repository Instructions

This repository publishes `cspell-config-nick2bad4u`.

## Public surfaces

- Treat `cspell.json`, every preset, the bundled dictionary, and typed API as public.
- Preserve CSpell's native ordered-import and array-union semantics.
- Keep project/user dictionaries and cache paths out of shared presets.
- Do not hide spelling errors with broad code/prose regular expressions.

## Verification

Run `npm run release:verify`. Tests must load the package through the real
CSpell CLI, reject a misspelling, and report no unknown dictionaries.
