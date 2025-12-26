import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'ghost' | 'outline', size?: 'default' | 'sm' | 'lg' | 'icon' }>(({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
        <button
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                // Variants
                variant === 'default' && "bg-primary text-primary-foreground shadow hover:bg-primary/90",
                variant === 'ghost' && "hover:bg-accent hover:text-accent-foreground",
                variant === 'outline' && "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
                // Sizes
                size === 'default' && "h-9 px-4 py-2",
                size === 'sm' && "h-8 rounded-md px-3 text-xs",
                size === 'lg' && "h-10 rounded-md px-8",
                size === 'icon' && "h-9 w-9",
                className
            )}
            {...props}
        />
    )
})
Button.displayName = "Button"

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => (
    <input
        type={type}
        className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className
        )}
        ref={ref}
        {...props}
    />
))
Input.displayName = "Input"

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "rounded-xl border bg-card text-card-foreground shadow",
            className
        )}
        {...props}
    />
))
Card.displayName = "Card"
