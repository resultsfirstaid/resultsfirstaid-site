# Supabase build integration

In Cloudflare Pages > Settings > Environment variables add **SUPABASE_SERVICE_ROLE_KEY** as an encrypted secret. Set **SUPABASE_URL** to `https://oezyfqemfxzwtqjixuph.supabase.co` (optional, already defaulted). Do not commit or expose the service-role key. The key is used only at build time; no credentials are written to `dist`.

Build command: `npm run build`; output: `dist`. Trigger a new deployment after editing Supabase content. This is build-time content, not live updates.

Published `public_course_content` rows control which courses appear once at least one such row exists; before that, all active shared courses appear. `marketing_clients` and `testimonials` require `published=true`.

Course pages are generated at `/course/<courses.slug>/`; preserve redirects from the previous `/course/hltaid009/` etc. if changing links. The old starter pages remain in the build for compatibility.

Prices are catalogue values, not live Acuity availability. Booking checkout and certificate portal are not connected. Verify content, accreditation statements, and SEO redirects before switching the production domain.
