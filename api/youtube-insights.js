const CACHE_TTL_MS = 1000 * 60 * 15;
const MAX_RESULTS_PER_PLAYLIST = 6;

let memoryCache = {
  expiresAt: 0,
  payload: null
};

const playlists = [
  {
    category: "Announcement",
    env: "YOUTUBE_ANNOUNCEMENTS_PLAYLIST_ID"
  },
  {
    category: "News",
    env: "YOUTUBE_NEWS_PLAYLIST_ID"
  }
];

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=3600");
  res.end(JSON.stringify(payload));
}

function compactDescription(description = "") {
  return description.replace(/\s+/g, " ").trim().slice(0, 170);
}

function bestThumbnail(thumbnails = {}) {
  return (
    thumbnails.maxres ||
    thumbnails.standard ||
    thumbnails.high ||
    thumbnails.medium ||
    thumbnails.default ||
    {}
  ).url;
}

async function fetchPlaylist({ apiKey, playlistId, category }) {
  const params = new URLSearchParams({
    part: "snippet,contentDetails",
    playlistId,
    maxResults: String(MAX_RESULTS_PER_PLAYLIST),
    key: apiKey
  });
  const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params}`);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`YouTube ${category} playlist failed: ${response.status} ${message}`);
  }

  const data = await response.json();
  return (data.items || [])
    .map((item) => {
      const snippet = item.snippet || {};
      const videoId = item.contentDetails?.videoId || snippet.resourceId?.videoId;

      if (!videoId || snippet.title === "Private video" || snippet.title === "Deleted video") {
        return null;
      }

      return {
        id: `${category.toLowerCase()}-${videoId}`,
        category,
        videoId,
        title: snippet.title || "IDH video update",
        description: compactDescription(snippet.description),
        publishedAt: snippet.publishedAt || item.contentDetails?.videoPublishedAt || "",
        thumbnail: bestThumbnail(snippet.thumbnails),
        embedUrl: `https://www.youtube.com/embed/${videoId}`
      };
    })
    .filter(Boolean);
}

module.exports = async function handler(req, res) {
  if (req.method && req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { items: [], error: "Method not allowed" });
  }

  const now = Date.now();
  if (memoryCache.payload && memoryCache.expiresAt > now) {
    return json(res, 200, { ...memoryCache.payload, cached: true });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  const configuredPlaylists = playlists
    .map((playlist) => ({
      ...playlist,
      playlistId: process.env[playlist.env]
    }))
    .filter((playlist) => playlist.playlistId);

  if (!apiKey || configuredPlaylists.length === 0) {
    return json(res, 200, {
      items: [],
      fallback: true,
      error: "YouTube API key or playlist IDs are not configured."
    });
  }

  try {
    const items = (await Promise.all(
      configuredPlaylists.map((playlist) => fetchPlaylist({ apiKey, ...playlist }))
    )).flat();
    const payload = {
      items: items.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)),
      fallback: items.length === 0
    };

    memoryCache = {
      expiresAt: now + CACHE_TTL_MS,
      payload
    };

    return json(res, 200, payload);
  } catch (error) {
    console.error(error);
    return json(res, 200, {
      items: [],
      fallback: true,
      error: "Unable to fetch YouTube videos."
    });
  }
};
