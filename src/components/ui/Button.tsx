import * as React from 'react';
import { cn } from '@/src/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'destructive';
    size?: 'default' | 'sm' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {
        return (
            <button
                className={cn(
                    // Base styles
                    'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 cursor-pointer',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
                    'disabled:pointer-events-none disabled:opacity-50',
                    'active:scale-95 transform',

                    // Variants
                    variant === 'default' &&
                    'bg-amber-600 text-white shadow-md hover:bg-amber-700 hover:shadow-lg active:shadow-sm',
                    variant === 'outline' &&
                    'border-2 border-amber-600 text-amber-900 hover:bg-amber-50 hover:border-amber-700 hover:shadow-md',
                    variant === 'ghost' &&
                    'text-amber-900 hover:bg-amber-100 hover:text-amber-800',
                    variant === 'destructive' &&
                    'bg-red-600 text-white shadow-md hover:bg-red-700 hover:shadow-lg active:shadow-sm',

                    // Sizes
                    size === 'default' && 'h-10 px-4 py-2 text-sm',
                    size === 'sm' && 'h-8 px-3 text-xs',
                    size === 'lg' && 'h-12 px-6 text-base',

                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';

export { Button };
