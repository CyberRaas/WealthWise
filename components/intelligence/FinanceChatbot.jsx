"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Send, X, MessageSquare, Sparkles, User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FinanceChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: "Hi! I'm your WealthWise assistant. I can help you with budgeting principles, savings strategies, or just thinking through a purchase. How can I help today?",
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [persona, setPersona] = useState("General");
    const scrollRef = useRef(null);
    const pathname = usePathname();

    // Scroll to bottom on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Prepare context based on current page (in a real app, you'd pull from a store)
            const context = `User is currently on page: ${pathname}.`;

            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    history: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
                    context,
                    persona: persona,
                }),
            });

            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = { role: "assistant", content: "" };

            setMessages((prev) => [...prev, assistantMessage]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const text = decoder.decode(value, { stream: true });
                assistantMessage.content += text;

                setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { ...assistantMessage };
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "I'm having trouble connecting right now. Please try again later." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6 z-50 transition-all duration-300">
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105",
                        isOpen ? "bg-red-500 hover:bg-red-600 rotate-90" : "bg-indigo-600 hover:bg-indigo-700"
                    )}
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
                </Button>
            </div>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-[90vw] max-w-[400px] h-[600px] max-h-[80vh] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">

                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">WealthWise AI</h3>
                                <p className="text-xs text-zinc-500">Financial Intelligence</p>
                            </div>
                        </div>
                        <Select value={persona} onValueChange={setPersona}>
                            <SelectTrigger className="w-[140px] h-8 text-xs bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="General">🧠 General</SelectItem>
                                <SelectItem value="Budget Agent">✂️ Budget Agent</SelectItem>
                                <SelectItem value="Savings Agent">💰 Savings Agent</SelectItem>
                                <SelectItem value="Debt Manager">📉 Debt Manager</SelectItem>
                                <SelectItem value="Investment Scout">🔭 Investment Scout</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex gap-3 max-w-[85%]",
                                    msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                                )}
                            >
                                <Avatar className="h-8 w-8 mt-1">
                                    <AvatarFallback className={cn(
                                        "text-[10px]",
                                        msg.role === "user" ? "bg-zinc-200 dark:bg-zinc-800" : "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600"
                                    )}>
                                        {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                    </AvatarFallback>
                                </Avatar>

                                <div
                                    className={cn(
                                        "rounded-2xl px-4 py-2 text-sm shadow-sm",
                                        msg.role === "user"
                                            ? "bg-indigo-600 text-white rounded-tr-none"
                                            : "bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-tl-none"
                                    )}
                                >
                                    <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                                        <ReactMarkdown
                                            components={{
                                                p: ({ node, ...props }) => <p className="mb-1 last:mb-0" {...props} />
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3 mr-auto max-w-[85%]">
                                <Avatar className="h-8 w-8 mt-1">
                                    <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600">
                                        <Bot className="h-4 w-4" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl rounded-tl-none px-4 py-2 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className="flex gap-2"
                        >
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about savings, debt, or spending..."
                                className="flex-1 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 focus-visible:ring-indigo-500 rounded-full px-4"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!input.trim() || isLoading}
                                className="rounded-full bg-indigo-600 hover:bg-indigo-700 shrink-0"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
