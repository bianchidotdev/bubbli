import type { ComponentProps, ReactNode } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TabListVariant = "pill" | "underline";

interface TabListProps extends Omit<ComponentProps<"div">, "children"> {
	/** Visual style of the tab bar */
	variant?: TabListVariant;
	children: ReactNode;
}

interface TabProps extends Omit<ComponentProps<"button">, "children"> {
	/** Whether this tab is currently selected */
	active?: boolean;
	children: ReactNode;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const listVariantClasses: Record<TabListVariant, string> = {
	pill: "flex gap-1 rounded-xl border border-border bg-surface-sunken p-1",
	underline: "flex gap-4 border-b border-border",
};

const tabBaseClasses =
	"inline-flex items-center justify-center gap-1.5 text-sm font-medium transition-all cursor-pointer";

const tabVariantClasses: Record<
	TabListVariant,
	{ active: string; inactive: string }
> = {
	pill: {
		active: "flex-1 rounded-lg bg-surface px-4 py-2 text-text shadow-sm",
		inactive: "flex-1 rounded-lg px-4 py-2 text-text-secondary hover:text-text",
	},
	underline: {
		active: "border-b-2 border-primary px-1 pb-2 text-primary",
		inactive:
			"border-b-2 border-transparent px-1 pb-2 text-text-secondary hover:text-text",
	},
};

// ---------------------------------------------------------------------------
// Context — lets Tab children know which variant their parent uses
// ---------------------------------------------------------------------------

import { createContext, useContext } from "react";

const TabListVariantContext = createContext<TabListVariant>("pill");

// ---------------------------------------------------------------------------
// TabList
// ---------------------------------------------------------------------------

function TabList({
	variant = "pill",
	className = "",
	children,
	...rest
}: TabListProps) {
	return (
		<TabListVariantContext value={variant}>
			<div
				role="tablist"
				className={`${listVariantClasses[variant]} ${className}`}
				{...rest}
			>
				{children}
			</div>
		</TabListVariantContext>
	);
}

// ---------------------------------------------------------------------------
// Tab
// ---------------------------------------------------------------------------

function Tab({ active = false, className = "", children, ...rest }: TabProps) {
	const variant = useContext(TabListVariantContext);
	const stateClasses = active
		? tabVariantClasses[variant].active
		: tabVariantClasses[variant].inactive;

	return (
		<button
			type="button"
			role="tab"
			aria-selected={active}
			className={`${tabBaseClasses} ${stateClasses} ${className}`}
			{...rest}
		>
			{children}
		</button>
	);
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { TabList, Tab };
export type { TabListVariant, TabListProps, TabProps };
