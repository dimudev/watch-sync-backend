const DIRECT_ID_REGEX = /^[\w-]{11}$/;

export function extractVideoId(input: string): string | null {
  if (!input) return null;
  const trimmedInput = input.trim();

  if (DIRECT_ID_REGEX.test(trimmedInput)) {
    return trimmedInput;
  }

  try {
    const urlString = trimmedInput.startsWith('http')
      ? trimmedInput
      : `https://${trimmedInput}`;

    const parsedUrl = new URL(urlString);
    const hostname = parsedUrl.hostname.replace('www.', '');

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      const vParam = parsedUrl.searchParams.get('v');
      if (vParam && DIRECT_ID_REGEX.test(vParam)) {
        return vParam;
      }

      const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
      if (['embed', 'shorts', 'v'].includes(pathSegments[0])) {
        if (pathSegments[1] && DIRECT_ID_REGEX.test(pathSegments[1])) {
          return pathSegments[1];
        }
      }
    }

    if (hostname === 'youtu.be') {
      const videoId = parsedUrl.pathname.slice(1);
      if (DIRECT_ID_REGEX.test(videoId)) {
        return videoId;
      }
    }
  } catch (e) {
    console.error('Error extracting video ID:', e);
    return null;
  }

  return null;
}
