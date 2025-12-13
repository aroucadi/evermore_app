
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OnboardingPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6">
      <div className="glass-panel w-full max-w-[400px] rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden relative">
        <div className="px-8 pt-10 pb-4 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-widest text-warm-primary uppercase">Step 1 of 2</span>
          </div>
          <div className="flex w-full gap-2 px-2">
            <div className="h-1.5 w-1/2 rounded-full bg-warm-primary shadow-sm"></div>
            <div className="h-1.5 w-1/2 rounded-full bg-gray-200/50 dark:bg-white/10"></div>
          </div>
        </div>
        <div className="px-8 pb-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-serif font-semibold leading-tight tracking-tight text-text-main dark:text-white mb-3">
              Who are we celebrating?
            </h1>
            <p className="text-text-sub dark:text-gray-400 text-sm leading-relaxed">
              We'll help you capture the priceless memories of the senior you love.
            </p>
          </div>
          <div className="flex flex-col gap-6">
            <Label className="flex flex-col gap-2 group">
              <span className="text-sm font-semibold text-text-main dark:text-gray-200 pl-1">Senior's Name</span>
              <div className="relative">
                <Input className="glass-input form-input w-full rounded-2xl h-14 px-5 pl-5 pr-12 text-base text-text-main dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-warm-primary dark:focus:border-warm-primary focus:ring-2 focus:ring-warm-primary/20 focus:bg-white/60 dark:focus:bg-black/30 transition-all duration-300" placeholder="e.g., Grandma Joyce" type="text"/>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-warm-primary/60 dark:text-warm-secondary/50 pointer-events-none text-[22px]">
                  sentiment_satisfied
                </span>
              </div>
            </Label>
            <Label className="flex flex-col gap-2 group">
              <div className="flex justify-between items-end pl-1 pr-1">
                <span className="text-sm font-semibold text-text-main dark:text-gray-200">Senior's Email</span>
                <span className="text-xs text-text-sub dark:text-gray-500 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-md">Optional</span>
              </div>
              <div className="relative">
                <Input className="glass-input form-input w-full rounded-2xl h-14 px-5 pl-5 pr-12 text-base text-text-main dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-warm-primary dark:focus:border-warm-primary focus:ring-2 focus:ring-warm-primary/20 focus:bg-white/60 dark:focus:bg-black/30 transition-all duration-300" placeholder="name@example.com" type="email"/>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-warm-primary/60 dark:text-warm-secondary/50 pointer-events-none text-[22px]">
                  mail
                </span>
              </div>
            </Label>
          </div>
        </div>
        <div className="flex-1 min-h-[32px]"></div>
        <div className="px-8 pb-8 pt-2 flex flex-col gap-4">
          <Button className="w-full h-14 bg-warm-primary hover:bg-[#d67e5b] text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-warm-primary/20 hover:shadow-warm-primary/40 active:scale-[0.98] transition-all duration-300 group">
            Next: Your Info
            <span className="material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:translate-x-1">
              arrow_forward
            </span>
          </Button>
          <Button variant="ghost" className="w-full h-10 text-text-sub dark:text-gray-400 hover:text-warm-primary dark:hover:text-warm-secondary font-medium text-sm flex items-center justify-center transition-colors duration-200">
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
