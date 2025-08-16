export function buildOgImageUrl({ id, title, description, category }: { id: string; title: string; description: string; category: string }) {
	const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD as string | undefined;
	if (!cloudName) return `/assets/og-default.png`;
	const base = `https://res.cloudinary.com/${cloudName}/image/upload`;
	// Very basic text overlay example; in real use, use a proper template
	const overlay = `l_text:Arial_60_bold:${encodeURIComponent(title)},co_rgb:111111,c_fit,w_1000/fl_layer_apply,g_north_west,x_100,y_180`;
	const sub = `l_text:Arial_36:${encodeURIComponent(category.toUpperCase())},co_rgb:8b5cf6/fl_layer_apply,g_north_west,x_100,y_100`;
	return `${base}/${overlay}/${sub}/w_1200,h_630,c_fill/v1700000000/og-bg.png`;
}