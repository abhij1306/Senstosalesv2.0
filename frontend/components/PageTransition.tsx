"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useContext, useRef, ReactNode } from "react";

// --- FrozenRouter ---
// Keeps the underlying route context "frozen" for the exiting component
// so it doesn't immediately update to the new page content while fading out.
function FrozenRouter(props: { children: ReactNode }) {
    const context = useContext(LayoutRouterContext ?? {});
    const frozen = useRef(context).current;

    return (
        <LayoutRouterContext.Provider value={frozen}>
            {props.children}
        </LayoutRouterContext.Provider>
    );
}

// --- PageTransition ---
// export default function PageTransition({ children }: { children: ReactNode }) {
//    // const pathname = usePathname();
//    return <>{children}</>;
// }

export default function PageTransition({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
                key={pathname}
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.01 }}
                transition={{
                    duration: 0.2,
                    ease: "easeOut",
                }}
                className="h-full w-full relative"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
