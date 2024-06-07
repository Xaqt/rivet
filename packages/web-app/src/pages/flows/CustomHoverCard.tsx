import * as HoverCard from "@radix-ui/react-hover-card";
import React, { type ReactNode } from 'react';

export default function CustomHoverCard({
  trigger,
  content,
  width = 160,
  isLabel = false,
}: {
  trigger: ReactNode;
  content: ReactNode;
  width?: number;
  isLabel?: boolean;
}) {
  return (
    <HoverCard.Root>
      <HoverCard.Trigger>
        <div className={"cursor-pointer"}>{trigger}</div>
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content sideOffset={2} side={isLabel ? "top" : "bottom"}>
          <HoverCard.Arrow
            className={isLabel ? "mb-1" : ""}
            fill={"rgba(31,37,46,0.80)"}
          />
          <span
            className={`${
              isLabel ? "cursor-pointer hover:text-[#ffc0c0]" : ""
            } flex text-xs text-center items-center justify-center bg-[rgba(31,37,46,0.80)] rounded p-2 max-w-[${width}px] text-white`}
          >
            {content}
          </span>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}
