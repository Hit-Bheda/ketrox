"use client";
import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export function NotesPopover({ notes }: { notes: string }) {
    const [open, setOpen] = useState(false);
    const limit = 150;

    const isLong = notes.length > limit;
    const shortText = isLong ? notes.slice(0, limit) + "..." : notes;

    if (!isLong) {

        return (
            <p className="text-sm text-muted-foreground">
                {shortText}
            </p>
        );
    }


    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild  >
                <button
                    type="button"
                    className="flex items-center space-x-1 cursor-pointer max-w-xs"
                    onMouseEnter={() => setOpen(true)}
                    onMouseLeave={() => setOpen(false)}
                >

                    <span className="text-sm text-left break-words line-clamp-3">
                        {shortText}
                    </span>
                </button>
            </PopoverTrigger>
            <PopoverContent
                side="top"
                align="end"
                className="max-w-md text-sm bg-[#dee0e6] text-[#1f2937] 
                           border border-[#d1d5db] shadow-lg shadow-black/30 
                           rounded-lg p-3 transition-all duration-300 
                         hover:bg-[#e7e9ef] hover:shadow-2xl hover:-translate-y-1 break-words"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}         
            >
                {notes}
            </PopoverContent>
        </Popover>
    );
}
