/**
 * Lightweight class name merging utility.
 *
 * Accepts any number of values — strings, false, null, undefined, or arrays
 * thereof — and joins only the truthy strings with a space.
 *
 * Usage:
 *   cn("px-4 py-2", isActive && "bg-primary", className)
 */

type ClassValue = string | false | null | undefined | ClassValue[];

function toVal(mix: ClassValue): string {
	if (typeof mix === "string") return mix;
	if (!mix) return "";
	if (Array.isArray(mix)) {
		let str = "";
		for (const item of mix) {
			const val = toVal(item);
			if (val) {
				str = str ? `${str} ${val}` : val;
			}
		}
		return str;
	}
	return "";
}

export function cn(...inputs: ClassValue[]): string {
	let result = "";
	for (const input of inputs) {
		const val = toVal(input);
		if (val) {
			result = result ? `${result} ${val}` : val;
		}
	}
	return result;
}
