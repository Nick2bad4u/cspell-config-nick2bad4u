# cspell-config-nick2bad4u

[![Continuous Integration](https://github.com/Nick2bad4u/cspell-config-nick2bad4u/actions/workflows/ci.yml/badge.svg)](https://github.com/Nick2bad4u/cspell-config-nick2bad4u/actions/workflows/ci.yml)

Composable [CSpell](https://cspell.org/) policies for code, documentation, web,
and Electron repositories.

## Install

```sh
npm install --save-dev cspell cspell-config-nick2bad4u
```

## Recommended setup

Create `cspell.json` in the consumer:

```json
{
 "import": ["cspell-config-nick2bad4u/recommended.json"],
 "dictionaryDefinitions": [
  {
   "addWords": true,
   "name": "project-words",
   "path": "./custom-words.txt"
  }
 ],
 "dictionaries": ["project-words"]
}
```

The project dictionary stays in the consumer. This package never writes to a
user-scoped dictionary.

## Composable presets

| Preset        | Purpose                                                       |
| ------------- | ------------------------------------------------------------- |
| `recommended` | Imports `base`, `code`, and `docs`.                           |
| `base`        | English/software vocabulary and generic ignores.              |
| `code`        | Node, npm, Git, shell, Docker, and TypeScript terms.          |
| `docs`        | Markdown, HTML entities, and license vocabulary.              |
| `web`         | CSS, HTML, and web-service vocabulary.                        |
| `electron`    | Electron project paths and Node/web vocabulary.               |
| `strict`      | Reports all unknown words and disables permissive heuristics. |

Add overlays in order; CSpell merges imports from first to last:

```json
{
 "import": [
  "cspell-config-nick2bad4u/recommended.json",
  "cspell-config-nick2bad4u/presets/web.json",
  "cspell-config-nick2bad4u/presets/strict.json"
 ]
}
```

## Scripts

```json
{
 "scripts": {
  "lint:spell": "cspell . --config cspell.json --gitignore"
 }
}
```

## JavaScript API

```js
import {
 createCspellConfig,
 getCspellConfigPath,
 loadCspellConfig,
} from "cspell-config-nick2bad4u";

const recommendedPath = getCspellConfigPath();
const strictOverlay = await loadCspellConfig("strict");
const customizedRawConfig = createCspellConfig("base", { minWordLength: 4 });
```

`loadCspellConfig` returns the raw file. CSpell itself resolves and merges its
`import` entries, which preserves CSpell's documented union behavior for array
settings.

## Policy boundaries

- Shared presets contain no repository names, user dictionaries, or cache paths.
- They do not ignore imports, declarations, Markdown prose, or JSON values.
- The bundled dictionary contains only cross-repository tooling terms.

## Requirements

- Node.js `^22.22.3`, `^24.16.0`, or `>=26.3.0`
- CSpell `^10.0.1`

## License

[MIT](LICENSE)
