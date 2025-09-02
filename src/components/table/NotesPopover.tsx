"use client";
import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export function NotesPopover({ notes }: { notes: string }) {
    const [open, setOpen] = useState(false);
    const limit = 40;


    const words = notes.split(" ");
    const isLong = words.length > limit;
    const shortText = isLong ? words.slice(0, limit).join(" ") + "..." : notes;

    

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
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
                className="max-w-md text-sm bg-white text-gray-700 shadow-md rounded-md p-2 break-words"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
            >
                {notes}
            </PopoverContent>
        </Popover>
    );
}
