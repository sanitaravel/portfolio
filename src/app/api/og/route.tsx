import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title");
  const description = searchParams.get("description") || "";
  const tags = searchParams.get("tags")?.split(",").filter(Boolean) || [];

  // Fallback: redirect to static image when title is missing
  if (!title) {
    return Response.redirect(new URL("/face.png", request.url));
  }

  try {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px",
            width: "100%",
            height: "100%",
            backgroundColor: "#0f0f0f",
            color: "#f5f5f5",
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              lineHeight: 1.2,
              marginBottom: 20,
            }}
          >
            {title}
          </div>

          {/* Description (conditional) */}
          {description && (
            <div
              style={{
                fontSize: 24,
                color: "#a0a0a0",
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
                    backgroundColor: "#2a2a2a",
                    color: "#60a5fa",
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
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch {
    // Fallback on any rendering error
    return Response.redirect(new URL("/face.png", request.url));
  }
}
