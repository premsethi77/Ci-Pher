# DevScope

A developer-tool discovery and comparison MVP powered by five public APIs.

## Features

- Search npm packages using the npm Registry search API.
- Enrich search results with GitHub repository stars when repository matches are available.
- Inspect package metadata, current version, license, dependencies, bundle size, and GitHub issue/star signals.
- Compare two packages side-by-side using npm Registry, Bundlephobia, and GitHub.
- Browse Hacker News discussions and DEV.to articles.
- Save packages to a browser-local shortlist.
- Responsive dark UI; no database or API key required for the MVP.

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

To make a production build:

```bash
npm run build
npm run preview
```

## APIs used

- npm Registry: `https://registry.npmjs.org`
- GitHub REST API: `https://api.github.com`
- Bundlephobia: `https://bundlephobia.com/api/size`
- Hacker News Algolia API: `https://hn.algolia.com/api/v1`
- DEV.to API: `https://dev.to/api`

## Notes and limitations

- This is a frontend MVP; API calls are made from the browser. GitHub's unauthenticated API has rate limits, and individual endpoints can be temporarily unavailable.
- Bundlephobia can fail for packages it cannot analyze or for versions with unsupported build configurations.
- Saved shortlist items are stored in `localStorage` on the current browser only.
- The "signal score" is a simple heuristic based on available popularity, recent activity, and license data. It is not a security rating and should not be treated as one.
- Before using this as a public production service, consider a backend proxy, caching, request throttling, stronger error states, and security advisory data.


## Updated product experience

- A first-run welcome flow asks what the developer is building or learning and stores the selected interests in the browser.
- The main screen presents one connected workflow: discover packages, inspect adoption/maintenance/size signals, compare alternatives, and save a shortlist.
- Provider names are intentionally kept out of the main product UI; the integrations work behind the scenes.
- Added subtle entrance, hover, ambient, and selection animations, with reduced-motion support.
- Package detail view also checks CDN usage as a small supplemental signal.

## Data integrations

The app uses the five requested sources for package discovery, repository signals, bundle analysis, and community content. A small supplemental CDN usage signal is retrieved from the jsDelivr package statistics endpoint. All requests are made from the browser; public services may rate-limit or fail independently. No API keys are required.

