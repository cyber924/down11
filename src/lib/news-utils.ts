export function getStaticImage(theme: string) {
  const themeUpper = theme?.toUpperCase() || "";
  if (['DRAMA', 'MOVIE', 'SHOW', 'ENTERTAINMENT'].includes(themeUpper)) {
    return "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80";
  }
  if (themeUpper === 'GOURMET' || themeUpper === 'HOTEL' || themeUpper === 'FOOD') {
    return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80";
  }
  if (themeUpper === 'VLOG') {
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";
  }
  if (themeUpper === 'TIPS' || themeUpper === 'POLICY') {
    return "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&q=80";
  }
  return "https://images.unsplash.com/photo-1469474968028-56623f02ffd9?auto=format&fit=crop&w=1200&q=80";
}

export function getThumbnailUrl(postId: string, post: any): string {
  const fields = ['localGuide', 'accommodationIntro', 'travelItinerary'];
  for (const field of fields) {
    const html = post[field] || "";
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match) {
      const src = match[1];
      if (src.startsWith('data:')) {
        return `/api/image?postId=${postId}&field=${field}&index=0`;
      }
      return src;
    }
  }
  return getStaticImage(post.theme);
}

export function extractSummary(post: any): string {
  const fullText = (post.localGuide || "") + " " + (post.accommodationIntro || "") + " " + (post.travelItinerary || "");
  const cleanText = fullText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return cleanText.slice(0, 180);
}

export function replaceBase64Images(postId: string, fieldName: string, html: string): string {
  if (!html) return html;
  
  let imgIndex = 0;
  const base64Regex = /src=["'](data:(image\/[^;]+);base64,[^"']+)["']/g;
  
  return html.replace(base64Regex, () => {
    const url = `/api/image?postId=${postId}&field=${fieldName}&index=${imgIndex}`;
    imgIndex++;
    return `src="${url}"`;
  });
}
