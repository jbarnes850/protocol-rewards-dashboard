import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../../lib/utils';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export const Tooltip = ({ content, children, side = 'top', align = 'center' }: TooltipProps) => {
  return (
    <TooltipPrimitive.Provider delayDuration={100}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>
          {children}
        </TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            className={cn(
              'z-50 overflow-hidden rounded-lg bg-gray-900/95 px-3 py-2 text-sm text-white shadow-xl',
              'border border-white/10 backdrop-blur-sm',
              'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-gray-900/95" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};