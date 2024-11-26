import * as React from 'react';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Trigger
    ref={ref}
    className={cn(
      'flex w-full items-center justify-between rounded-lg px-4 py-2 text-left hover:bg-white/5',
      className
    )}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
  </CollapsiblePrimitive.Trigger>
));
CollapsibleTrigger.displayName = 'CollapsibleTrigger';

const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className={cn(
      'overflow-hidden transition-all data-[state=closed]:animate-collapse-up data-[state=open]:animate-collapse-down',
      className
    )}
    {...props}
  >
    <div className="pb-4 pt-2 px-4">{children}</div>
  </CollapsiblePrimitive.Content>
));
CollapsibleContent.displayName = 'CollapsibleContent';

export { Collapsible, CollapsibleTrigger, CollapsibleContent }; 