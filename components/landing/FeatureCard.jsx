"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function FeatureCard({ icon: Icon, title, description, color, bg, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -5 }}
            className="group relative"
        >
            {/* Background Glow */}
            <div className={cn(
                "absolute -inset-0.5 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-20 blur-xl transition duration-500",
                bg.replace('bg-', 'from-').replace('dark:bg-', 'dark:from-')
            )} />

            <div className="relative h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl transition-all duration-300 group-hover:border-slate-300 dark:group-hover:border-slate-700">
                <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110",
                    bg
                )}>
                    <Icon className={cn("w-6 h-6", color)} />
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {title}
                </h3>

                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {description}
                </p>

                <div className="mt-6 flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Learn more →
                </div>
            </div>
        </motion.div>
    );
}
