# Results First Aid — public training website starter

A complete static multi-page website, designed for Cloudflare Pages. No build process is required.

## Deploy

Upload the **contents** of this folder to the root of your GitHub repository (not the enclosing folder). In Cloudflare Pages, use framework preset **None**, build command **blank**, and output directory **/** (repository root). If your Cloudflare setup requires a build output folder, use the included `package.json` and `npm run build`, with output directory `dist`.

## Important before publishing over the live Wix website

- This is a new standalone starter, **not** a migration of the existing Wix pages or Acuity implementation. The previous booking code was not supplied. Booking is deliberately an enquiry workflow, not fake live inventory.
- **Replace all photo placeholders with genuine Results photography** (search `photo-block` in HTML). A temporary typographic logo is used because the actual logo asset was not provided. Replace with the approved Results brand files.
- Confirm current course codes, accredited scope, duration, prerequisites, price and locations.
- Confirm HQ address/postcode and public contact details.
- Replace the draft privacy page with the approved privacy policy.
- Connect and test Acuity, payment/checkout and the student management API before advertising online booking or certificates.
- Audit existing Wix URLs, search traffic, page metadata and backlinks. Create a page-by-page redirect map before switching DNS. Do not overwrite the live site without this step.
- The Training Finder is a simple deterministic starter and does **not** establish legal compliance. Its rules need subject matter review.
- The contact form composes a mailto email; it is not a server-side submission.

## Routes

`/`, `/courses/`, `/course/hltaid009/`, `/course/hltaid011/`, `/course/hltaid012/`, `/locations/`, `/training-finder/`, `/my-training/`, `/about/`, `/contact/`, `/privacy/`.

## Files

All pages are standalone static HTML with shared CSS/JS in `assets/`. No external JS frameworks.
