
import { z } from "zod";

export const designTokensSchema = z.object({
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
}).strict();
