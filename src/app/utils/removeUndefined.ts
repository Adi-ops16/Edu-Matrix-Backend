type RemoveUndefined<T> = {
	[K in keyof T]: Exclude<T[K], undefined>;
};

export const removeUndefined = <T extends Record<string, unknown>>(
	payload: T,
) => {
	return Object.fromEntries(
		Object.entries(payload).filter(([, val]) => val !== undefined),
	) as Partial<RemoveUndefined<T>>;
};
