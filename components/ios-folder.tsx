"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import Image from "next/image"
import type { BlogContent } from "@/types/blog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface IOSFolderProps {
    blog: BlogContent
}

export function IOSFolder({ blog }: IOSFolderProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="flex flex-col items-center gap-2">
            <motion.div
                layoutId={`folder-${blog.id}`}
                onClick={() => setIsOpen(true)}
                className="relative w-24 h-24 bg-white/20 dark:bg-black/20 backdrop-blur-xl rounded-[22px] p-2 cursor-pointer shadow-lg border border-white/20 dark:border-white/10 overflow-hidden group hover:scale-105 transition-transform"
            >
                <div className="grid grid-cols-2 gap-1 h-full w-full">
                    {blog.thumbnails.slice(0, 4).map((src, i) => (
                        <div key={i} className="relative aspect-square rounded-md overflow-hidden bg-muted">
                            <Image
                                src={src || "/placeholder.svg"}
                                alt=""
                                fill
                                className="object-cover transition-transform group-hover:scale-110"
                            />
                        </div>
                    ))}
                </div>
            </motion.div>
            <span className="text-[13px] font-medium text-black drop-shadow-sm select-none">{blog.title}</span>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
                    >
                        {/* Backdrop Blur */}
                        <motion.div
                            initial={{ backdropFilter: "blur(0px)" }}
                            animate={{ backdropFilter: "blur(20px)" }}
                            exit={{ backdropFilter: "blur(0px)" }}
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setIsOpen(false)}
                        />

                        <motion.div
                            layoutId={`folder-${blog.id}`}
                            className="relative w-full max-w-4xl h-[90vh] bg-background rounded-[40px] shadow-2xl overflow-hidden flex flex-col"
                        >
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setIsOpen(false)
                                }}
                                className="absolute top-6 right-6 z-10 p-2 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <ScrollArea className="h-full w-full">
                                <div className="relative w-full h-[40vh] min-h-[300px]">
                                    <Image
                                        src={blog.heroImage || "/placeholder.svg"}
                                        alt={blog.title}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                                </div>

                                <div className="max-w-2xl mx-auto px-6 py-12 md:px-12">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{blog.title}</h1>
                                        <div className="flex flex-col gap-1 mb-12">
                                            <p className="text-lg text-muted-foreground font-medium">{blog.subtitle}</p>
                                            <p className="text-sm text-primary/60 font-medium tracking-wide uppercase">{blog.location}</p>
                                        </div>

                                        <div className="space-y-8">
                                            {blog.sections.map((section, idx) => (
                                                <div key={idx}>
                                                    {section.type === "text" ? (
                                                        <p className="text-lg leading-relaxed text-foreground/80 font-serif">{section.content}</p>
                                                    ) : (
                                                        <div className="relative aspect-video rounded-3xl overflow-hidden my-8">
                                                            <Image src={section.content || "/placeholder.svg"} alt="" fill className="object-cover" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                </div>
                            </ScrollArea>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
