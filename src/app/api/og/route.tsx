import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

const JETBRAINS_MONO_REGULAR_URL =
  "https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-400-normal.woff";
const JETBRAINS_MONO_BOLD_URL =
  "https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-700-normal.woff";

async function loadFonts() {
  const [regular, bold] = await Promise.all([
    fetch(JETBRAINS_MONO_REGULAR_URL).then((res) => res.arrayBuffer()),
    fetch(JETBRAINS_MONO_BOLD_URL).then((res) => res.arrayBuffer()),
  ]);
  return { regular, bold };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title");
  const description = searchParams.get("description") || "";
  const tags = searchParams.get("tags")?.split(",").filter(Boolean) || [];
  const image = searchParams.get("image") || "";

  // Fallback: redirect to static image when title is missing
  if (!title) {
    return Response.redirect(new URL("/face.png", request.url));
  }

  // Resolve the image URL to an absolute URL if provided
  const imageUrl = image ? new URL(image, request.url).toString() : "";

  try {
    const fonts = await loadFonts();

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            padding: "60px",
            width: "100%",
            height: "100%",
            backgroundColor: "#262626",
            color: "#FEFEFE",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {/* Left: Text content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
              paddingRight: imageUrl ? "40px" : "0",
            }}
          >
            {/* Title */}
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                lineHeight: 1.2,
                marginBottom: 20,
                color: "#FEFEFE",
              }}
            >
              {title}
            </div>

            {/* Description (conditional) */}
            {description && (
              <div
                style={{
                  fontSize: 24,
                  color: "rgba(254, 254, 254, 0.7)",
                  lineHeight: 1.4,
                  marginBottom: 24,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {description}
              </div>
            )}

            {/* Tags (conditional) */}
            {tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {tags.map((tag) => (
                  <div
                    key={tag}
                    style={{
                      fontSize: 16,
                      backgroundColor: "rgba(255, 128, 20, 0.15)",
                      color: "#FF8014",
                      padding: "6px 14px",
                      borderRadius: "6px",
                    }}
                  >
                    {tag.trim()}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Image (conditional) */}
          {imageUrl && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "280px",
                height: "280px",
                borderRadius: "50%",
                overflow: "hidden",
                flexShrink: 0,
                border: "3px solid rgba(255, 128, 20, 0.5)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                width={280}
                height={280}
                style={{
                  objectFit: "cover",
                  width: "280px",
                  height: "280px",
                }}
                alt=""
              />
            </div>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "JetBrains Mono",
            data: fonts.regular,
            weight: 400,
            style: "normal",
          },
          {
            name: "JetBrains Mono",
            data: fonts.bold,
            weight: 700,
            style: "normal",
          },
        ],
      }
    );
  } catch {
    // Fallback on any rendering error
    return Response.redirect(new URL("/face.png", request.url));
  }
}
