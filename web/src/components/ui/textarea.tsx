import { forwardRef, type TextareaHTMLAttributes } from "react";

import { cn } from "./utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TextareaProps
	extends TextareaHTMLAttributes<HTMLTextAreaElement> {
	/** Visual variant */
	variant?: "default" | "ghost";
	/** Whether the textarea is in an error state */
	error?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
	({ className, variant = "default", error = false, ...props }, ref) => {
		return (
			<textarea
				ref={ref}
				className={cn(
					// Base
					"block w-full text-sm text-text transition-all",
					"placeholder:text-text-placeholder",
					"disabled:cursor-not-allowed disabled:opacity-50",
					"focus:outline-none",

					// Resize
					"resize-y min-h-[5rem]",

					// Variants
					variant === "default" && [
						"rounded-lg border bg-surface px-3.5 py-2.5 shadow-sm",
						error
							? "border-danger focus:border-danger focus:ring-2 focus:ring-danger/20"
							: "border-border-strong focus:border-border-focus focus:ring-2 focus:ring-ring",
					],

					variant === "ghost" && [
						"rounded-lg border border-transparent bg-transparent px-3.5 py-2.5",
						error
							? "border-danger focus:border-danger focus:ring-2 focus:ring-danger/20"
							: "hover:bg-surface-sunken focus:border-border-focus focus:bg-surface focus:ring-2 focus:ring-ring",
					],

					className,
				)}
				{...props}
			/>
		);
	},
);

Textarea.displayName = "Textarea";
