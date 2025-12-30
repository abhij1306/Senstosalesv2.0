import fs from "fs";
import path from "path";
import { z } from "zod";
import { createHash } from "crypto";

// Embedded Schema to ensure robustness in standalone script execution
const designTokensSchema = z.object({
    theme: z.enum(["dark", "light"]),
    brand: z.object({
        primary: z.string(),
        background: z.string(),
    }),
    effects: z.object({
        surface: z.enum(["claymorphic", "flat", "glass"]),
        depth: z.string(),
        interaction: z.object({
            hover: z.string(),
            transition_ms: z.number(),
        }),
        glass: z.enum(["optional", "required", "none"]),
    }),
    motion: z.object({
        library: z.string(),
        reduce_on_low_power_devices: z.boolean(),
    }),
    layout: z.object({
        radius_scale: z.array(z.string()),
        layout_mode: z.string().optional(), // Added resiliency
        shadow_style: z.string(),
        padding_min: z.string(),
        feedback_states: z.array(z.string()),
    }),
    performance: z.object({
        lazy_load_heavy_components: z.boolean(),
        avoid_re_render_chains: z.boolean(),
        memoize_static_ui_parts: z.boolean(),
        critical_css_in_bundle: z.boolean(),
    }),
}); // Removed .strict() for now to allow minor flexibility during dev, or keep if strict requirement. User said strict.
// User said "Use .strict() to prevent silent corruption". I will keep strict but ensure JSON matches.

const TOKENS_PATH = path.join(process.cwd(), "design-tokens.json");

try {
    const rootPath = path.resolve(process.cwd(), "design-tokens.json");

    if (!fs.existsSync(rootPath)) {
        console.error("❌ design-tokens.json not found at project root!");
        process.exit(1);
    }

    const raw = fs.readFileSync(rootPath, "utf-8");
    const json = JSON.parse(raw);

    const result = designTokensSchema.strict().safeParse(json);

    if (!result.success) {
        console.error("❌ Design Token Validation Failed:");
        console.error(JSON.stringify(result.error.format(), null, 2));
        process.exit(1);
    }

    console.log("✅ Design Tokens Validated Successfully.");
    console.log(`🔒 Token Hash: ${createHash('sha256').update(raw).digest('hex')}`);

} catch (error) {
    console.error("❌ Fatal Error validating design tokens:", error);
    process.exit(1);
}
