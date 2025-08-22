import { useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export function DescriptionPopover({ description }: { description: string }) {
  const [open, setOpen] = useState(false);
  const limit = 135;

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
        className="max-w-sm text-sm"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {description}
      </PopoverContent>
    </Popover>
  );
}
