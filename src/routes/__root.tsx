import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { LOOK_BOOT } from "@/lib/look";
import { pageMeta, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import appCss from "../styles.css?url";

// Only the families the stylesheet uses. Google serves Arabic in its own file, which a
// browser fetches only when Arabic text is on screen.
const FONTS =
  "https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500;6..96,600&family=Tinos:ital,wght@0,400;0,700;1,400&family=Noto+Naskh+Arabic:wght@500;600&display=swap";

export const Route = createRootRoute({
  // Site-wide defaults; a section or reading page replaces the title, description and
  // link-preview tags with its own.
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0c0c0c" },
      ...pageMeta({ title: SITE_NAME, description: SITE_DESCRIPTION, path: "/" }),
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: FONTS },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* Applies a saved colour scheme before the first paint. */}
        <script dangerouslySetInnerHTML={{ __html: LOOK_BOOT }} />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
