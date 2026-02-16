import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImagePlaceholderProps {
  path: string;
  alt?: string;
  className?: string;
  aspectRatio?: "square" | "portrait" | "landscape" | "video";
}

export function ImagePlaceholder({
  path,
  alt = "Photo placeholder",
  className,
  aspectRatio = "square",
}: ImagePlaceholderProps) {
  const aspectClasses = {
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    landscape: "aspect-[4/3]",
    video: "aspect-video",
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-muted border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2",
        aspectClasses[aspectRatio],
        className
      )}
    >
      <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
      <div className="text-center px-4">
        <p className="text-xs text-muted-foreground font-medium">{alt}</p>
        <p className="text-[10px] text-muted-foreground/70 mt-1">{path}</p>
      </div>
    </div>
  );
}
