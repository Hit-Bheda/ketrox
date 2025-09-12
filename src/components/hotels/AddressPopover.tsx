"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export function AddressPopover({ address }: { address: string }) {
  const [open, setOpen] = useState(false);
  const limit = 10;


  const words = address.split(" ");
  const isLong = words.length > limit;
  const shortText = isLong ? words.slice(0, limit).join(" ") + "..." : address;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center space-x-1 cursor-pointer max-w-xs"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-left truncate">{shortText}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="max-w-md text-sm bg-[#f59e0a] text-gray-900 rounded-md p-2 break-words"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {address}
      </PopoverContent>
    </Popover>
  );
}
