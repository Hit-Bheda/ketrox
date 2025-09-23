import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export function DescriptionPopover({ description }: { description: string }) {
  const [open, setOpen] = useState(false);
  const limit = 155 ;

  // Check if description is longer than limit
  const isLong = description.length > limit;
  const shortText = isLong ? description.slice(0, limit) + "..." : description;

  if (!isLong) {
 
    return (
      <p className="text-sm text-muted-foreground">
        {shortText}
      </p>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <p
          className="text-sm text-muted-foreground cursor-pointer"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {shortText}
        </p>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
       className="max-w-md text-sm bg-[#dee0e6] text-[#1f2937] 
           border border-[#d1d5db] shadow-lg shadow-black/30 
           rounded-lg p-3 transition-all duration-300 
           hover:bg-[#e7e9ef] hover:shadow-2xl hover:-translate-y-1"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {description}
      </PopoverContent>
    </Popover>
  );
}
