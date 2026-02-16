"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Bell, Search, Star, MessageSquare, User } from "lucide-react";

export default function MobileAppPage() {
    return (
        <div className="min-h-screen">
            {/* Hero */}
            <section className="relative py-20 lg:py-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8 animate-in slide-in-from-left duration-700">
                            <Badge variant="secondary" className="px-4 py-1.5 text-sm bg-primary/10 text-primary border-primary/20 rounded-full">
                                Investor Preview • Version 1.0
                            </Badge>
                            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight leading-tight">
                                The future of car buying<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">in your pocket.</span>
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-[600px] leading-relaxed">
                                Experience the seamless marketplace with real-time notifications, instant messaging, and exclusive mobile-first features.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <div className="flex-1 max-w-sm flex gap-2">
                                    <Input placeholder="Enter your email" className="h-12 bg-background/50 border-input/50" />
                                    <Button size="lg" className="h-12 px-8 font-semibold">
                                        Join Waitlist
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className={`w-8 h-8 rounded-full border-2 border-background bg-slate-${i * 100 + 200}`} />
                                    ))}
                                </div>
                                <p>Join 2,000+ others on the waitlist</p>
                            </div>
                        </div>

                        {/* Mockup */}
                        <div className="relative mx-auto border-gray-900 bg-gray-900 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl shadow-primary/20 animate-in slide-in-from-right duration-1000">
                            <div className="h-[32px] w-[3px] bg-gray-900 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
                            <div className="h-[46px] w-[3px] bg-gray-900 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                            <div className="h-[46px] w-[3px] bg-gray-900 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                            <div className="h-[64px] w-[3px] bg-gray-900 absolute -right-[17px] top-[142px] rounded-r-lg"></div>
                            <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-background dark:bg-slate-950 relative flex flex-col">
                                {/* App Status Bar */}
                                <div className="h-6 w-full flex justify-between px-4 items-center text-[10px] font-medium pt-1">
                                    <span>9:41</span>
                                    <div className="flex gap-1">
                                        <div className="w-3 h-3 bg-current rounded-full opacity-20"></div>
                                        <div className="w-3 h-3 bg-current rounded-full opacity-20"></div>
                                        <div className="w-3 h-3 bg-current rounded-full"></div>
                                    </div>
                                </div>

                                {/* App Header */}
                                <div className="px-4 py-2 flex items-center justify-between">
                                    <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">Kaarplus</span>
                                    <div className="p-2 bg-secondary/50 rounded-full relative">
                                        <Bell size={18} />
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                    </div>
                                </div>

                                {/* App Content */}
                                <div className="flex-1 overflow-hidden p-4 space-y-4 pb-20">
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-2.5 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
                                        <Input className="pl-9 h-10 bg-secondary/50 border-none rounded-xl" placeholder="Search BMW..." />
                                    </div>

                                    {/* Categories */}
                                    <div className="flex gap-3 overflow-hidden pb-1">
                                        {['All', 'SUV', 'Sedan', 'Sport'].map((cat, i) => (
                                            <div key={cat} className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                                                {cat}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Car Card 1 */}
                                    <div className="border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-card">
                                        <div className="h-32 bg-slate-200 dark:bg-slate-800 relative group">
                                            <Badge className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm">New</Badge>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                                        </div>
                                        <div className="p-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-sm">BMW 320d xDrive</h3>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">2022 • 45,000 km • Diesel</p>
                                                </div>
                                                <div className="bg-primary/10 p-1.5 rounded-full text-primary">
                                                    <Star size={12} />
                                                </div>
                                            </div>
                                            <p className="text-primary font-bold mt-2 text-lg">35 900 €</p>
                                        </div>
                                    </div>
                                    {/* Car Card 2 */}
                                    <div className="border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-card">
                                        <div className="h-32 bg-slate-200 dark:bg-slate-800 relative">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                                        </div>
                                        <div className="p-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-sm">Audi A6 quattro</h3>
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">2020 • 95,000 km • Diesel</p>
                                                </div>
                                                <div className="bg-secondary/50 p-1.5 rounded-full text-muted-foreground">
                                                    <Star size={12} />
                                                </div>
                                            </div>
                                            <p className="text-primary font-bold mt-2 text-lg">41 500 €</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Bottom Nav */}
                                <div className="absolute bottom-0 w-full h-16 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-around text-muted-foreground pb-2">
                                    <div className="flex flex-col items-center gap-1 text-primary">
                                        <Search size={22} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col items-center gap-1 hover:text-primary transition-colors">
                                        <Star size={22} />
                                    </div>
                                    <div className="flex flex-col items-center gap-1 hover:text-primary transition-colors">
                                        <div className="bg-primary rounded-full p-2 -mt-6 shadow-lg text-primary-foreground">
                                            <Smartphone size={24} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center gap-1 hover:text-primary transition-colors">
                                        <MessageSquare size={22} />
                                    </div>
                                    <div className="flex flex-col items-center gap-1 hover:text-primary transition-colors">
                                        <User size={22} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
