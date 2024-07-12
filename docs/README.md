# cartokit Docs

[![Built with Starlight](https://astro.badg.es/v2/built-with-starlight/tiny.svg)](https://starlight.astro.build)

This repository contains the source code for the [`cartokit` documentation site](https://alpha.cartokit.dev/docs).

## Project Structure

The `cartokit` docs follow Starlight's conventions on structure.

### Content

All pages live inside as `.md` or `.mdx` files in the `src/content/docs/` directory. Each file is exposed as a route based on its file name.

### Images and Videos

Images live in `src/assets/`. You can bring images directly into `.md` or `.mdx` files using relative links.

Videos live in `public` and can be embedded by either using the HTML `<video>` and `<source>` elements or, preferably, using our [custom `<Video>` component](/docs/src/components/Video.astro) in a `.mdx` file. All values passed for the `src` prop should be string paths relative to `public`.

### Styles

We use [Tailwind](https://tailwindcss.com/) to manage our CSS, powered by [Astro's Tailwind integration](https://starlight.astro.build/guides/css-and-tailwind/#tailwind-css).

### Custom Components

We have a handful of custom components that we use to enhance the `cartokit` docs beyond Starlight's defaults.

| Component Name              | Component Description                                                                                                                                                                                                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Card.astro`                | A variant of Starlight's [`Card.astro`](https://github.com/withastro/starlight/blob/main/packages/starlight/user-components/Card.astro) implementation, supporting arbitrary colors and icons from Vercel's [Geist Design System](https://vercel.com/geist/icons).                                      |
| `DarkLogo.astro`            | `cartokit`'s dark mode logo variant, separated into an Astro component to avoid polluting the markup.                                                                                                                                                                                                   |
| `Hero.astro`                | A variant of Starlight's [`Hero.astro`](https://github.com/withastro/starlight/blob/main/packages/starlight/components/Hero.astro) implementation, supporting a `<video>` in the hero and some custom CSS. We override the default `Hero` implementation in [astro.config.mjs](/docs/astro.config.mjs). |
| `Icon.astro` and `Icons.ts` | A variant of Starlight's [`Icon.astro`](https://github.com/withastro/starlight/blob/main/packages/starlight/components/Icon.astro) implementation, supporting icons from Vercel's [Geist Design System](https://vercel.com/geist/icons).                                                                |
| `Logo.astro`                | `cartokit`'s dark mode logo variant, separated into an Astro component to avoid polluting the markup.                                                                                                                                                                                                   |
| `Pagination.astro`          | A variant of Starlight's [`Pagination.astro`](https://github.com/withastro/starlight/blob/main/packages/starlight/components/Pagination.astro) implementation, with some custom styling. We override the default `Pagination` implementation in [astro.config.mjs](/docs/astro.config.mjs).             |
| `Video.astro`               | A simple abstraction over the browser's `<video>` element, with styles pre-applied.                                                                                                                                                                                                                     |

## Commands

All commands are run from the root of the `docs` folder. We use [`pnpm`](https://pnpm.io/) as our package manager.

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `pnpm install`         | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |
