# Mark Thebault Site

Personal website for `mark-thebault.pro`, built with Astro and deployed to GitHub Pages.

## Use

```sh
npm install
npm run dev
```

Build the static site:

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

## Content

Articles live in `src/content/articles`.

```text
YYYY-MM-DD_my-article.md
```

Article URLs do not include the date prefix. For example:

```text
src/content/articles/2019-03-30_spark-k8s.md
/articles/spark-k8s/
```

Work items live in `src/content/work`.

```text
YYYY-MM-DD_my-work-item.md
```

Draft or unfinished content can stay outside the content loader by using another extension, such as `.md.todo`.

## Deploy

GitHub Pages deploys from `.github/workflows/deploy.yml` on pushes to `main`.

Repository settings should use:

```text
Pages source: GitHub Actions
Custom domain: mark-thebault.pro
```

Update the domain in these files if it changes:

```text
astro.config.mjs
src/consts.ts
public/CNAME
```
