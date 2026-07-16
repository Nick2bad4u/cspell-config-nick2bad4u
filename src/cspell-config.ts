import type { JsonObject } from "type-fest";

import { fileURLToPath } from "node:url";
import { arrayIncludes, arrayJoin } from "ts-extras";

import recommendedConfig from "../cspell.json" with { type: "json" };
import baseConfig from "../presets/base.json" with { type: "json" };
import codeConfig from "../presets/code.json" with { type: "json" };
import docsConfig from "../presets/docs.json" with { type: "json" };
import electronConfig from "../presets/electron.json" with { type: "json" };
import strictConfig from "../presets/strict.json" with { type: "json" };
import webConfig from "../presets/web.json" with { type: "json" };

/** Portable CSpell configuration. */
export type CspellConfig = Readonly<JsonObject>;

/** Bundled composable policy choices. */
export type CspellPreset =
    | "base"
    | "code"
    | "docs"
    | "electron"
    | "recommended"
    | "strict"
    | "web";

/** All bundled preset names in stable display order. */
export const cspellPresets: readonly CspellPreset[] = Object.freeze([
    "recommended",
    "base",
    "code",
    "docs",
    "web",
    "electron",
    "strict",
]);

const presetConfigs: Readonly<Record<CspellPreset, CspellConfig>> = {
    base: baseConfig,
    code: codeConfig,
    docs: docsConfig,
    electron: electronConfig,
    recommended: recommendedConfig,
    strict: strictConfig,
    web: webConfig,
};

const presetPaths: Readonly<Record<CspellPreset, string>> = {
    base: fileURLToPath(new URL("../presets/base.json", import.meta.url)),
    code: fileURLToPath(new URL("../presets/code.json", import.meta.url)),
    docs: fileURLToPath(new URL("../presets/docs.json", import.meta.url)),
    electron: fileURLToPath(
        new URL("../presets/electron.json", import.meta.url)
    ),
    recommended: fileURLToPath(new URL("../cspell.json", import.meta.url)),
    strict: fileURLToPath(new URL("../presets/strict.json", import.meta.url)),
    web: fileURLToPath(new URL("../presets/web.json", import.meta.url)),
};

const isPreset = (value: unknown): value is CspellPreset =>
    arrayIncludes(cspellPresets, value);

/**
 * Create a raw config object with consumer overrides. CSpell performs its own
 * import merging when the resulting object is loaded by CSpell.
 */
export function createCspellConfig(
    preset: CspellPreset = "recommended",
    overrides: CspellConfig = {}
): CspellConfig {
    return structuredClone({ ...presetConfigs[preset], ...overrides });
}

/**
 * Return the absolute path to one bundled CSpell config or overlay.
 *
 * @throws {@link RangeError} If `preset` is not bundled.
 */
export function getCspellConfigPath(
    preset: CspellPreset = "recommended"
): string {
    if (!isPreset(preset)) {
        throw new RangeError(
            `Unknown CSpell preset: ${String(valueForMessage(preset))}. Expected one of: ${arrayJoin(cspellPresets, ", ")}.`
        );
    }
    return presetPaths[preset];
}

/** Load the raw JSON for one config or overlay. */
export function loadCspellConfig(
    preset: CspellPreset = "recommended"
): Promise<CspellConfig> {
    return Promise.resolve(structuredClone(presetConfigs[preset]));
}

function valueForMessage(value: unknown): unknown {
    return value;
}

/** Recommended import stack (`base` + `code` + `docs`). */
const defaultConfig: CspellConfig = Object.freeze(createCspellConfig());

export default defaultConfig;
