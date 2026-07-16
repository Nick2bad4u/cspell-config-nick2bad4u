import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import defaultConfig, {
    createCspellConfig,
    type CspellPreset,
    cspellPresets,
    getCspellConfigPath,
    loadCspellConfig,
} from "../src/cspell-config.js";

const fixture = { root: "" };
const cspellCliPath = fileURLToPath(
    new URL("../node_modules/cspell/bin.mjs", import.meta.url)
);

beforeAll(async () => {
    fixture.root = await mkdtemp(path.join(tmpdir(), "cspell-config-"));
});

afterAll(async () => {
    await rm(fixture.root, { force: true, recursive: true });
});

function runCspell(configPath: string, filePath: string) {
    return spawnSync(
        process.execPath,
        [
            cspellCliPath,
            "--config",
            configPath,
            "--no-progress",
            filePath,
        ],
        { cwd: path.dirname(configPath), encoding: "utf8" }
    );
}

describe("cSpell presets", () => {
    it.each(cspellPresets)("loads the raw %s config", async (preset) => {
        const configPath = getCspellConfigPath(preset);

        await expect(loadCspellConfig(preset)).resolves.toStrictEqual(
            JSON.parse(await readFile(configPath, "utf8"))
        );
    });

    it("keeps the default export aligned with recommended", async () => {
        expect(defaultConfig).toStrictEqual(await loadCspellConfig());
    });

    it("keeps project dictionaries out of shared configuration", async () => {
        const configs = await Promise.all(
            cspellPresets.map(async (preset) => loadCspellConfig(preset))
        );
        const serialized = JSON.stringify(configs);

        expect(serialized).not.toContain("Uptime-Watcher");
        expect(serialized).not.toContain('"scope":"user"');
    });

    it("lets consumers replace raw options", () => {
        const config = createCspellConfig("strict", { minWordLength: 5 });

        expect(config["minWordLength"]).toBe(5);
        expect(config["unknownWords"]).toBe("report-all");
    });

    it("rejects invented presets", () => {
        expect(() => getCspellConfigPath("gaming" as CspellPreset)).toThrow(
            RangeError
        );
    });

    it("loads the package import stack in the real CSpell CLI", async () => {
        const configPath = path.join(fixture.root, "cspell.json");
        const sourcePath = path.join(fixture.root, "valid.md");
        const imports = [getCspellConfigPath()];
        await Promise.all([
            writeFile(
                configPath,
                `${JSON.stringify({ import: imports }, null, 2)}\n`
            ),
            writeFile(
                sourcePath,
                "# Tooling\n\nTypeScript, Codecov, markdownlint, and djLint are configured.\n"
            ),
        ]);

        const result = runCspell(configPath, sourcePath);

        expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
        expect(`${result.stdout}${result.stderr}`).not.toContain(
            "Unknown Dictionary"
        );
    });

    it("reports a real misspelling", async () => {
        const configPath = path.join(fixture.root, "strict.json");
        const sourcePath = path.join(fixture.root, "invalid.md");
        const imports = [getCspellConfigPath(), getCspellConfigPath("strict")];
        await Promise.all([
            writeFile(
                configPath,
                `${JSON.stringify(
                    {
                        import: imports,
                    },
                    null,
                    2
                )}\n`
            ),
            writeFile(sourcePath, "This sentnce contains a misspeling.\n"),
        ]);

        const result = runCspell(configPath, sourcePath);

        expect(result.status).toBe(1);
        expect(`${result.stdout}${result.stderr}`).toContain("misspeling");
    });
});
