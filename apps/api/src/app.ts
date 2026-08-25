import path from "node:path";
import { existsSync } from "node:fs";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import hpp from "hpp";
import pinoHttp from "pino-http";
import { corsOrigins } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { globalRateLimit } from "./middleware/rateLimit.js";
import { generateCsrfToken } from "./middleware/csrf.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./modules/auth/routes.js";
import { usersRouter } from "./modules/users/routes.js";
import { addressesRouter } from "./modules/addresses/routes.js";
import { categoriesRouter } from "./modules/categories/routes.js";
import { productsRouter } from "./modules/products/routes.js";
import { cartRouter } from "./modules/cart/routes.js";
import { ordersRouter } from "./modules/orders/routes.js";
import { wishlistRouter } from "./modules/wishlist/routes.js";
import { uploadsRouter } from "./modules/uploads/routes.js";
import { paymentsRouter } from "./modules/payments/routes.js";

export const app = express();

// Correct client IP behind a reverse proxy (nginx on ShardCloud) — required for
// IP-keyed rate limiting to work against the real client, not the proxy.
app.set("trust proxy", 1);

app.use(pinoHttp({ logger, redact: ["req.headers.cookie", "req.headers.authorization"] }));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // accounts.google.com/gsi/client renders the "Continuar com Google" button and
        // handles the credential exchange inside its own iframe — required for that flow.
        // static.cloudflareinsights.com is injected automatically by Cloudflare (fronting
        // ShardCloud apps, and the intended setup once the domain moves behind Cloudflare
        // DNS) — it can't be stripped from the response, so it has to be allow-listed.
        scriptSrc: ["'self'", "https://accounts.google.com/gsi/client", "https://static.cloudflareinsights.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com/gsi/style", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:"],
        mediaSrc: ["'self'"],
        // viacep.com.br is a free, public, no-auth CEP (Brazilian postal code) lookup —
        // used client-side to auto-fill the address form, never sent anything of ours.
        connectSrc: ["'self'", "https://accounts.google.com", "https://cloudflareinsights.com", "https://viacep.com.br"],
        frameSrc: ["https://accounts.google.com"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "x-csrf-token"],
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(cookieParser());
app.use(hpp());

// Baseline rate limit applied to EVERY route before it reaches any specific handler;
// individual routers additionally apply a tighter, resource-appropriate tier on top.
app.use(globalRateLimit);

// Uploaded product photos/videos — served as plain static files, never executed.
app.use(
  "/uploads",
  express.static(path.resolve(process.cwd(), "uploads"), {
    dotfiles: "deny",
    index: false,
    setHeaders: (res) => {
      res.setHeader("Content-Disposition", "inline");
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  }),
);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// The frontend fetches this to obtain a CSRF token, then sends it back via the
// x-csrf-token header on every mutating request. Always overwrite rather than try to
// reuse the existing cookie: the double-submit hash is bound to a session identifier
// (the access-token cookie, when present) that changes on login/logout, so reusing a
// token issued under a different session would otherwise throw instead of just handing
// back a fresh, correctly-scoped one.
app.get("/api/csrf-token", (req, res) => {
  res.status(200).json({ csrfToken: generateCsrfToken(req, res, true) });
});

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/addresses", addressesRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/products", productsRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/payments", paymentsRouter);

// Serve the built React app from the same process/port as the API — this is the
// entire point of running from the repo root's server.js on a single-service host
// like ShardCloud, which exposes exactly one port per app. Skipped entirely if the
// web app hasn't been built (e.g. plain API-only local dev).
const webDistPath = path.resolve(process.cwd(), "apps/web/dist");
if (existsSync(webDistPath)) {
  app.use(express.static(webDistPath, { index: false }));

  // SPA fallback: a GET for a client-side route (e.g. /produto/:slug) has no matching
  // file on disk, so it falls through here and gets index.html. Only routes without a
  // file extension qualify — otherwise a genuinely-missing asset (e.g. a JS/CSS bundle
  // from a build that's since been superseded, still referenced by a stale cached HTML
  // page) would get a 200 of index.html's markup back with the wrong Content-Type
  // instead of a real 404, which is exactly the kind of thing that silently breaks a
  // page after a redeploy.
  app.get(/^\/(?!api\/|uploads\/).*/, (req, res, next) => {
    if (path.extname(req.path)) {
      next();
      return;
    }
    res.sendFile(path.join(webDistPath, "index.html"));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);
