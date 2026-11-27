# Pissadakis P.P. — website

Static site: 3D logo hero (Three.js + GSAP ScrollTrigger), 3D fly-through projects, gallery, contact.

## Adding the projects' photos
1. Put the photos in `assets/projects/` (e.g. `ergo-01.jpg`).
2. Edit `js/projects.js` and write each file name in `src`, plus title / place / year.

## Running it locally
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000. You can host it on GitHub Pages, Netlify, or Vercel without a build step.
