"use client";

import { useState, useEffect, useRef } from "react";
import { Calculator, Clock, ArrowRight, RotateCcw, Briefcase, Zap, AlertTriangle, Sparkles as SparklesIcon, Loader2 } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const FaceAnimation = ({ type }) => {
    const variants = {
        happy: { path: "M 8 16 Q 12 20 16 16", color: "#10B981" }, // Emerald-500
        neutral: { path: "M 8 18 L 16 18", color: "#F59E0B" }, // Amber-500
        sad: { path: "M 8 18 Q 12 14 16 18", color: "#EF4444" } // Red-500
    };

    const ui = variants[type] || variants.neutral;

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-32 h-32 mx-auto mb-6"
        >
            <motion.div
                className="w-full h-full rounded-full border-4 flex items-center justify-center bg-white dark:bg-slate-900 shadow-xl"
                style={{ borderColor: ui.color }}
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
            >
                <svg width="100%" height="100%" viewBox="0 0 24 24" className="w-20 h-20">
                    {/* Eyes */}
                    <motion.circle cx="8" cy="9" r="1.5" fill={ui.color}
                        initial={{ scaleY: 1 }}
                        animate={{ scaleY: [1, 0.1, 1] }}
                        transition={{ repeat: Infinity, duration: 3, delay: 1 }}
                    />
                    <motion.circle cx="16" cy="9" r="1.5" fill={ui.color}
                        initial={{ scaleY: 1 }}
                        animate={{ scaleY: [1, 0.1, 1] }}
                        transition={{ repeat: Infinity, duration: 3, delay: 1 }}
                    />

                    {/* Mouth */}
                    <motion.path
                        d={ui.path}
                        stroke={ui.color}
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5 }}
                    />
                </svg>
            </motion.div>

            {/* Bounce effect shadow */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-2 bg-black/10 rounded-full blur-sm" />
        </motion.div>
    );
};

export function WorthItWizard({ customTrigger }) {
    const { profileData } = useProfile();
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState("input"); // 'input' | 'analyzing' | 'result'
    const [aiInsight, setAiInsight] = useState("");
    const [isAiLoading, setIsAiLoading] = useState(false);

    // We assume income is available in profile. If not, default to 0 (which handles safely in logic)
    const [data, setData] = useState({
        itemName: "",
        price: "",
        hoursIsWork: 160,
        happinessDuration: 2, // 1=Days, 2=Weeks, 3=Months, 4=Years
        isNeed: false,
    });

    const income = parseFloat(profileData?.monthlyIncome) || 0;

    const reset = () => {
        setView("input");
        setAiInsight("");
        setData({
            itemName: "",
            price: "",
            hoursIsWork: 160,
            happinessDuration: 2,
            isNeed: false,
        });
    };

    const calculateMetrics = () => {
        const price = parseFloat(data.price) || 0;
        const hourlyRate = income / data.hoursIsWork;
        if (hourlyRate <= 0) return { hours: 0, days: 0 };
        return {
            hours: Math.round((price / hourlyRate) * 10) / 10,
            days: Math.round(((price / hourlyRate) / 8) * 10) / 10
        };
    };

    const getVerdict = (daysNeeded) => {
        if (data.isNeed) return { type: "happy", text: "Go for it!", sub: "It's a need, just budget wisely." };

        // Want Logic
        if (daysNeeded > 5 && data.happinessDuration < 3)
            return { type: "sad", text: "Skip it", sub: "High cost for short-term joy." };
        if (daysNeeded > 2)
            return { type: "neutral", text: "Delay 1 Week", sub: "Sleep on it first." };

        return { type: "happy", text: "Treat Yourself", sub: "You earned this reward!" };
    };

    const fetchAiAdvice = async () => {
        setIsAiLoading(true);
        setAiInsight("");

        try {
            const prompt = `
                I am considering buying "${data.itemName}" for ₹${data.price}.
                My monthly income is ₹${income}.
                Is it a necessity? ${data.isNeed ? "Yes" : "No"}.
                Expected happiness duration: ${["Few Days", "Weeks", "Months", "Years"][data.happinessDuration - 1]}.

                Act as a brutally honest financial advisor.
                Structure your response like this:
                1. 💰 **The Math**: "₹${data.price} is X% of your monthly income." (Calculate this).
                2. ⚖️ **The Rule**: Validate against 50/30/20 rule.
                3. 🧠 **The Verdict**: Clear 'Buy', 'Delay', or 'Skip'.
                4. ❓ **Ask Yourself**: 1 thoughtful question.

                Keep it under 100 words. Use emojis. Be direct.
            `;

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: [{ role: "user", content: prompt }]
                })
            });

            if (!response.ok) throw new Error("Failed to fetch advice");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                setAiInsight(prev => prev + chunk);
            }
        } catch (error) {
            console.error(error);
            setAiInsight("Could not generate AI insights at the moment. Trust your gut!");
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleAnalyze = () => {
        if (!data.itemName || !data.price) return;
        setView("analyzing");
        setTimeout(() => {
            setView("result");
            fetchAiAdvice();
        }, 1500); // Fake analyzing delay for effect
    };

    const metrics = calculateMetrics();
    const verdict = getVerdict(metrics.days);

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) reset(); }}>
            <DialogTrigger asChild>
                {customTrigger || (
                    <Button
                        variant="outline"
                        className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-medium"
                    >
                        <Calculator className="h-4 w-4 mr-2 text-indigo-500" />
                        Is It Worth It?
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden bg-slate-50 dark:bg-slate-950 border-0 shadow-2xl rounded-3xl">
                <DialogHeader className="sr-only">
                    <DialogTitle>Worth It Wizard</DialogTitle>
                </DialogHeader>

                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {/* INPUT VIEW: Single Form (Old Way style but cleaner) */}
                        {view === "input" && (
                            <motion.div
                                key="input"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-5"
                            >
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                        Quick Check
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                                        Input details to check the real cost.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {/* Item & Price Row */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="col-span-2">
                                            <Input
                                                placeholder="Item Name (e.g. Watch)"
                                                value={data.itemName}
                                                onChange={(e) => setData({ ...data, itemName: e.target.value })}
                                                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-12 rounded-xl"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                                                <Input
                                                    type="number"
                                                    placeholder="Price"
                                                    value={data.price}
                                                    onChange={(e) => setData({ ...data, price: e.target.value })}
                                                    className="pl-7 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-12 rounded-xl"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Need vs Want Toggle */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div
                                            onClick={() => setData({ ...data, isNeed: false })}
                                            className={cn(
                                                "cursor-pointer rounded-xl p-4 border-2 transition-all text-center space-y-2",
                                                !data.isNeed
                                                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                                                    : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200"
                                            )}
                                        >
                                            <div className="font-bold text-slate-800 dark:text-white">Want 🎁</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                                                Nice to have, but not essential for survival.
                                            </div>
                                        </div>

                                        <div
                                            onClick={() => setData({ ...data, isNeed: true })}
                                            className={cn(
                                                "cursor-pointer rounded-xl p-4 border-2 transition-all text-center space-y-2",
                                                data.isNeed
                                                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                                                    : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200"
                                            )}
                                        >
                                            <div className="font-bold text-slate-800 dark:text-white">Need ⚡️</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                                                Essential for life, work, or health.
                                            </div>
                                        </div>
                                    </div>

                                    {/* Happiness Duration (Only if Want) */}
                                    <AnimatePresence>
                                        {!data.isNeed && (
                                            <motion.div
                                                key="happiness"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="space-y-3 overflow-hidden mt-4"
                                            >
                                                <div className="text-center">
                                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                        Happiness Duration
                                                    </label>
                                                </div>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {["Days", "Weeks", "Months", "Years"].map((label, idx) => (
                                                        <button
                                                            key={label}
                                                            onClick={() => setData({ ...data, happinessDuration: idx + 1 })}
                                                            className={cn(
                                                                "py-3 px-1 text-sm font-semibold rounded-xl transition-all border-2",
                                                                data.happinessDuration === idx + 1
                                                                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-500"
                                                                    : "border-slate-100 bg-white text-slate-500 hover:border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700"
                                                            )}
                                                        >
                                                            {label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <Button
                                    onClick={handleAnalyze}
                                    disabled={!data.itemName || !data.price}
                                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 text-lg font-semibold mt-4"
                                >
                                    Analyze <SparklesIcon className="w-5 h-5 ml-2" />
                                </Button>
                            </motion.div>
                        )}


                        {/* ANALYZING VIEW */}
                        {view === "analyzing" && (
                            <motion.div
                                key="analyzing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-12 text-center"
                            >
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-indigo-100 dark:border-slate-800 rounded-full animate-spin border-t-indigo-600" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Zap className="w-6 h-6 text-indigo-600" />
                                    </div>
                                </div>
                                <h3 className="mt-6 text-xl font-bold text-slate-800 dark:text-white">Calculating Real Cost...</h3>
                                <p className="text-slate-500 dark:text-slate-400 mt-2">Checking budget impact & happiness ROI</p>
                            </motion.div>
                        )}


                        {/* RESULT VIEW */}
                        {view === "result" && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center"
                            >
                                <FaceAnimation type={verdict.type} />

                                <h2 className={cn("text-3xl font-black mb-1",
                                    verdict.type === 'happy' ? "text-emerald-600" :
                                        verdict.type === 'sad' ? "text-red-500" : "text-amber-500"
                                )}>
                                    {verdict.text}
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium mb-6">
                                    {verdict.sub}
                                </p>

                                {/* Time Cost Card */}
                                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 mb-6">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Real Time Cost</h4>
                                    <div className="flex items-baseline justify-center gap-2">
                                        <span className="text-4xl font-black text-slate-900 dark:text-white">{metrics.hours}</span>
                                        <span className="text-sm font-bold text-slate-500 uppercase">Hours of work</span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-1">
                                        (~{metrics.days} working days)
                                    </p>
                                </div>

                                {/* AI Insights Box */}
                                <div className="text-left bg-indigo-50 dark:bg-indigo-900/10 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/30 mb-6 relative overflow-hidden">
                                    {/* Background decoration */}
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <SparklesIcon className="w-24 h-24 text-indigo-600" />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
                                                <SparklesIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-100">AI Advisor Verdict</h4>
                                        </div>

                                        <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed min-h-[60px]">
                                            {aiInsight ? (
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                        strong: ({ node, ...props }) => <span className="font-bold text-indigo-700 dark:text-indigo-300" {...props} />,
                                                        ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 mb-2" {...props} />,
                                                        li: ({ node, ...props }) => <li className="pl-1 marker:text-indigo-400" {...props} />,
                                                    }}
                                                >
                                                    {aiInsight}
                                                </ReactMarkdown>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-6 gap-3 text-slate-400">
                                                    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                                    <span className="text-xs font-medium animate-pulse">Analyzing financial impact...</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="ghost" onClick={reset} className="text-slate-500 hover:text-slate-700">
                                        Check Another
                                    </Button>
                                    <Button onClick={() => setIsOpen(false)} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200">
                                        Done
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}
