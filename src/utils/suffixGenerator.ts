export const suffixGenerator = (origin: string) =>
	Date.now() + '-' + Math.round(Math.random() * 1e9) + '-' + origin;
