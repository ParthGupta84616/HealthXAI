import React from 'react';
import { cn } from '../../utils/classNames';

export const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
        "disabled:opacity-50 disabled:pointer-events-none",
        {
          "bg-blue-500 text-white hover:bg-blue-600": variant === "default",
          "bg-white text-gray-800 border border-gray-300 hover:bg-gray-100": variant === "outline",
          "bg-red-500 text-white hover:bg-red-600": variant === "destructive",
        },
        className
      )}
      ref={ref}
      {...props}
    />
  );
});