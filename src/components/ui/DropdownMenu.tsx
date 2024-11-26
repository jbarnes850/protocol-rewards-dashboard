import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '../../lib/utils';
import type { LucideIcon } from 'lucide-react';

interface DropdownMenuItem {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
}

export const DropdownMenu = ({ trigger, items }: DropdownMenuProps) => {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        {trigger}
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          className={cn(
            'z-50 min-w-[8rem] overflow-hidden rounded-md border border-white/10',
            'bg-white p-1 text-gray-900 shadow-md animate-in data-[side=bottom]:slide-in-from-top-2',
            'data-[side=top]:slide-in-from-bottom-2 dark:bg-gray-800 dark:text-gray-100'
          )}
        >
          {items.map((item, index) => (
            <DropdownMenuPrimitive.Item
              key={index}
              className={cn(
                'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
                'transition-colors focus:bg-gray-100 focus:text-gray-900 dark:focus:bg-gray-700 dark:focus:text-gray-100',
                'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
              )}
              onClick={item.onClick}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </DropdownMenuPrimitive.Item>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
};