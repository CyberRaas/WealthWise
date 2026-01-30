"use client";

import { useState } from "react";
import { Copy, Sparkles, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";

export function ConceptCard({ title, category, emoji, shortDesc, context }) {
    const [explanation, setExplanation] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const fetchExplanation = async () => {
        if (explanation) return;
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    history: [{
                        role: "user",
                        content: `Explain the financial concept "${title}" simply for a beginner. focus on practical application.`
                    }],
                    context: "User is in the Knowledge Garden learning hub.",
                }),
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let text = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                text += decoder.decode(value, { stream: true });
                setExplanation(text);
            }
        } catch (err) {
            setExplanation("Sorry, I couldn't load the explanation right now.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog onOpenChange={(open) => open && fetchExplanation()}>
            <DialogTrigger asChild>
                <div className="group relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Sparkles className="h-4 w-4 text-indigo-500" />
                    </div>

                    <div className="text-4xl mb-4">{emoji}</div>

                    <div className="space-y-1">
                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                            {category}
                        </span>
                        <h3 className="font-bold text-lg dark:text-zinc-100 leading-tight">
                            {title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                            {shortDesc}
                        </p>
                    </div>
                </div>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-2xl">
                        <span className="text-3xl">{emoji}</span> {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4 space-y-4">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800">
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-zinc-500">
                            <BookOpen className="h-4 w-4" /> Quick Summary
                        </h4>
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                            {shortDesc}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                            <Sparkles className="h-4 w-4" /> AI Deep Dive
                        </h4>

                        <div className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 min-h-[100px]">
                            {isLoading && !explanation ? (
                                <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                                    Thinking...
                                </div>
                            ) : (
                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                    <ReactMarkdown
                                        components={{
                                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                            li: ({ node, ...props }) => <li className="marker:text-zinc-400" {...props} />
                                        }}
                                    >
                                        {explanation}
                                    </ReactMarkdown>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
