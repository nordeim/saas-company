"use client";

/**
 * The ROOT error boundary (Session 13 F2) — the last resort when the
 * error occurs in the ROOT LAYOUT itself (error.tsx is bypassed for
 * layout-level failures). global-error replaces the whole document, so
 * it ships its own <html>/<body> shell and INLINE styling hooks — the
 * root layout's globals.css may be what crashed.
 *
 * The inline style object keeps the brand canvas (#000, system font
 * fallback with the Vend Sans stack preferred) — a debrandized crash
 * page is never acceptable. Same recovery contract as error.tsx: Try
 * again (reset()) + Go to home. Never reached in normal operation (the
 * segment boundary answers first) — the belt to its braces.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[global-error-boundary]", error.message, error.digest ?? "");

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#000",
          color: "#fff",
          fontFamily:
            "'Vend Sans', 'Vend Sans Fallback', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div role="alert" style={{ maxWidth: "448px", width: "100%", textAlign: "center" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 600, margin: "0 0 8px" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: "0 0 24px" }}>
            The application hit an unexpected error. Your data is safe — try
            again, or head back home.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button
              onClick={reset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 600,
                background: "#fff",
                color: "#000",
                border: "none",
                borderRadius: "9999px",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "9999px",
                textDecoration: "none",
              }}
            >
              Go to home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
