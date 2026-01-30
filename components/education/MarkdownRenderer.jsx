import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

export function MarkdownRenderer({ content, className }) {
    return (
        <div className={cn("space-y-6 text-slate-700 dark:text-slate-300", className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ node, ...props }) => (
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-8 mb-4 border-b pb-2 border-slate-200 dark:border-slate-800" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4 flex items-center gap-2" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mt-6 mb-3" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                        <p className="text-lg leading-relaxed mb-4 text-slate-700 dark:text-slate-300" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                        <ul className="my-4 space-y-2 list-none pl-1" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                        <ol className="my-4 space-y-2 list-decimal list-inside marker:text-emerald-600 dark:marker:text-emerald-400 marker:font-bold" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                        <li className="flex items-start gap-2.5 text-lg" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                        <strong className="font-bold text-slate-900 dark:text-white" {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 pl-4 py-3 pr-4 rounded-r-lg italic text-slate-700 dark:text-slate-300 my-6" {...props} />
                    ),
                    code: ({ node, inline, className, children, ...props }) => {
                        return inline ? (
                            <code className="bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded text-sm font-mono font-medium" {...props}>
                                {children}
                            </code>
                        ) : (
                            <pre className="bg-slate-900 text-slate-50 p-4 rounded-xl overflow-x-auto my-6 text-sm">
                                <code className="font-mono" {...props}>{children}</code>
                            </pre>
                        );
                    },
                    table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <table className="w-full text-left border-collapse" {...props} />
                        </div>
                    ),
                    thead: ({ node, ...props }) => (
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                        <th className="p-4 border-b border-slate-200 dark:border-slate-700 font-bold text-sm uppercase tracking-wider whitespace-nowrap" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                        <td className="p-4 border-b border-slate-200 dark:border-slate-700 text-base" {...props} />
                    ),
                    hr: ({ node, ...props }) => (
                        <hr className="my-8 border-slate-200 dark:border-slate-800" {...props} />
                    ),
                    img: ({ node, ...props }) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="rounded-xl w-full my-6 shadow-md" alt={props.alt || ''} {...props} />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
