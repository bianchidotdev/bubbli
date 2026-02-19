# Bubbli

Bubbli is a social application with two main parts:

- **Backend** (`/`): An Elixir/Phoenix API server using Ash Framework, serving a JSON:API
- **Frontend** (`/web`): A React SPA using Vite, TanStack Router, TanStack Query, and Tailwind CSS v4

## Project structure

```
bubbli/
├── config/              # Elixir app configuration
├── lib/
│   ├── bubbli/          # Core business logic (Ash domains, resources)
│   │   ├── accounts/    # User accounts, authentication
│   │   └── social/      # Social features (posts, circles, etc.)
│   └── bubbli_web/      # Phoenix endpoint, router, controllers (JSON:API only)
├── priv/                # Migrations, seeds, static assets
├── test/                # Elixir tests
├── web/                 # React SPA (separate from Phoenix)
│   ├── src/
│   │   ├── api/         # API client (openapi-fetch), auth helpers, generated schema
│   │   ├── components/
│   │   │   └── ui/      # Design system component library (see below)
│   │   ├── lib/         # Shared hooks and providers (auth, theme)
│   │   └── routes/      # TanStack Router file-based routes
│   ├── biome.json       # Linter/formatter config (tabs, double quotes)
│   ├── package.json
│   └── vite.config.ts
├── mix.exs
├── Caddyfile            # Local reverse proxy config
└── lefthook.yml         # Git hooks
```

## General guidelines

- Use `mix precommit` alias when you are done with all changes and fix any pending issues
- Use the already included and available `:req` (`Req`) library for HTTP requests, **avoid** `:httpoison`, `:tesla`, and `:httpc`. Req is included by default and is the preferred HTTP client for Phoenix apps

---

## Tidewave MCP

This project includes [Tidewave](https://tidewave.ai), which exposes an MCP server at `http://localhost:4000/tidewave/mcp` (streamable HTTP). It integrates your coding agent directly with the Phoenix runtime, giving it access to logs, the database, documentation, and live code evaluation — all within the context of the running app.

### Available tools

| Tool                   | What it does                                                        |
|------------------------|---------------------------------------------------------------------|
| `project_eval`         | Evaluate Elixir code in the running application context             |
| `get_docs`             | Fetch documentation for any module/function (project or deps)       |
| `get_source_location`  | Find the source file for any module/function (project or deps)      |
| `get_logs`             | Read application logs (excluding tool-generated noise)              |
| `get_ecto_schemas`     | List all Ecto schema modules and their file paths                   |
| `execute_sql_query`    | Run SQL queries against the project's Ecto repo (PostgreSQL)        |
| `search_package_docs`  | Search Hex documentation for the project's dependencies             |

### Agent rules

Always prefer Tidewave tools over manual alternatives:

- Use `project_eval` to evaluate Elixir code — **never** use shell tools for this
- Use `get_docs` to read module/function documentation and `get_source_location` to find definitions — these work even for dependencies not yet used in the codebase
- Use `execute_sql_query` to inspect database state (read-only queries)
- Use `get_ecto_schemas` to discover available schemas instead of grepping the file system
- Use `get_logs` to check for runtime errors or request logs
- Use `search_package_docs` to search Hex docs for any project dependency

### Database safety

- **Never** execute `INSERT`, `UPDATE`, `DELETE`, `DROP`, `TRUNCATE`, `ALTER`, or any other mutating SQL via `execute_sql_query` — it is for **read-only queries only** (e.g., `SELECT`, `EXPLAIN`)
- All database mutations must go through application code (Ash actions, Ecto changesets, migrations) so that validations, policies, and audit trails are respected
- If you need to seed or fix data, use `project_eval` to call the appropriate Ash/Ecto functions instead

### Tidewave MCP vs LSP

Tidewave MCP complements (does not replace) Language Server Protocol tooling. Key differences:

- **LSP** is file/line/column-based — it can only find information about symbols already referenced in the codebase
- **Tidewave MCP** uses Elixir's module/function notation — it can explore any module or function, even from dependencies not yet imported
- **Tidewave MCP** performs **runtime analysis**, which captures meta-programmed code (e.g., Ash resources, Ecto schemas) that static analysis misses
- **Tidewave MCP** provides runtime-only capabilities (`project_eval`, `execute_sql_query`, `get_logs`) that LSP cannot offer

Use both: Tidewave MCP for runtime intelligence, LSP for diagnostics and symbol search.

---

## Frontend (`/web`)

### Package manager

- **Always use `bun`** as the package manager. **Never** use `npm`, `yarn`, or `pnpm`
- Install dependencies: `bun install`
- Run scripts: `bun run dev`, `bun run build`, `bun run check`, etc.
- Add dependencies: `bun add <package>` / `bun add -d <package>`

### Stack overview

| Concern        | Tool                       |
|----------------|----------------------------|
| Framework      | React 19                   |
| Bundler        | Vite (rolldown-vite)       |
| Routing        | TanStack Router (file-based) |
| Data fetching  | TanStack Query + openapi-fetch |
| Styling        | Tailwind CSS v4            |
| Linting/Format | Biome (tabs, double quotes) |
| Type checking  | TypeScript ~5.9            |

### Lint and format

- Run `bun run check` to auto-fix lint and formatting issues
- Run `bun run lint` for check-only mode
- Biome is configured with tabs for indentation and double quotes for strings
- **Always** run `bun run check` before committing frontend changes

### Tailwind CSS v4

- Tailwind v4 **does not use a `tailwind.config.js`**
- Configuration lives in `web/src/app.css` using `@import "tailwindcss"` and `@theme`
- **Never** use `@apply` when writing raw CSS
- **Never** use daisyUI or similar component libraries — use the project's own design system

### JS and CSS rules

- Out of the box **only the `app.js` and `app.css` bundles are supported** in the web app
- **Never write inline `<script>` tags within templates**
- Import vendor dependencies into `app.js` or `app.css` rather than referencing external URLs

---

## Design system (`web/src/components/ui/`)

The project has a custom component library built on **semantic design tokens** and **CSS custom properties**, registered with Tailwind v4's `@theme` directive. All components automatically support light and dark themes.

### Theming architecture

1. **Design tokens** are defined in `web/src/app.css` as CSS custom properties under `:root` / `[data-theme="light"]` and `[data-theme="dark"]` selectors
2. Tokens are registered with `@theme { }` so Tailwind generates utilities like `bg-primary`, `text-text-secondary`, `border-border`, etc.
3. **`ThemeProvider`** (`web/src/lib/theme.tsx`) manages the active theme, persists preference to localStorage, and syncs across tabs
4. Themes are applied via a `data-theme` attribute on `<html>`

### Semantic color tokens

Always use these semantic tokens instead of raw Tailwind palette colors (e.g., use `bg-primary` not `bg-violet-600`):

| Token                | Purpose                              |
|----------------------|--------------------------------------|
| `primary`            | Brand/action color                   |
| `primary-hover`      | Hovered primary                      |
| `primary-soft`       | Soft primary background              |
| `on-primary`         | Text on primary backgrounds          |
| `on-primary-soft`    | Text on soft primary backgrounds     |
| `accent`             | Secondary brand color                |
| `surface`            | Base surface (cards, modals)         |
| `surface-raised`     | Elevated surfaces                    |
| `surface-sunken`     | Recessed backgrounds                 |
| `surface-overlay`    | Backdrop overlays                    |
| `text`               | Primary text                         |
| `text-secondary`     | Secondary text                       |
| `text-tertiary`      | Muted/hint text                      |
| `text-placeholder`   | Placeholder text                     |
| `border`             | Default borders                      |
| `border-strong`      | Emphasized borders                   |
| `border-focus`       | Focus ring border                    |
| `danger` / `success` / `warning` / `info` | Status colors (with `-soft`, `-border`, `on-` variants) |

### Available components

**Always** import from the barrel export `@/components/ui` (or `../components/ui` relative):

```tsx
import { Button, Input, Card, Alert, Avatar, Spinner } from "@/components/ui";
```

| Component       | File                | Key props / notes                                           |
|-----------------|---------------------|-------------------------------------------------------------|
| `Button`        | `button.tsx`        | `variant`: `primary`/`secondary`/`ghost`/`danger`/`accent`; `size`: `sm`/`md`/`lg`; `loading`, `iconLeft`, `iconRight` |
| `Input`         | `input.tsx`         | `size`: `sm`/`md`/`lg`; `error`; `leadingAddon`, `trailingAddon` |
| `Textarea`      | `textarea.tsx`      | `variant`: `default`/`ghost`; `error`                       |
| `Select`        | `select.tsx`        | `selectSize`: `sm`/`md`/`lg`; `variant`: `default`/`ghost`; `error`; includes chevron icon |
| `Card`          | `card.tsx`          | `variant`: `raised`/`flat`/`outlined`; sub-components: `Card.Header` (`heading`, `description`, `action`), `Card.Body`, `Card.Footer` (`align`) |
| `Avatar`        | `avatar.tsx`        | `size`: `xs`/`sm`/`md`/`lg`/`xl`; `src`, `displayName`, `email`; gradient fallback with initials |
| `Spinner`       | `spinner.tsx`       | `size`: `xs`/`sm`/`md`/`lg`; uses `<output>` element for a11y |
| `Alert`         | `alert.tsx`         | `status`: `error`/`success`/`warning`/`info`; `title`, `onDismiss`; default status icons |
| `Badge`         | `badge.tsx`         | `variant`: `default`/`primary`/`success`/`danger`/`warning`/`info`; `size`, `solid`, `dot` |
| `FormField`     | `form-field.tsx`    | `label`, `htmlFor`, `hint`, `error`; wraps any input component |
| `ThemeToggle`   | `theme-toggle.tsx`  | Segmented picker for light/dark/system; also `ThemeToggleCompact` (icon-only cycle button) |

### Component usage rules

- **Always** use design system components instead of raw HTML elements for buttons, inputs, selects, textareas, cards, alerts, and avatars
- **Always** use semantic token classes (`bg-primary`, `text-text`, `border-border`, etc.) instead of raw Tailwind palette colors (`bg-violet-600`, `text-gray-900`, etc.) in all files
- When adding new components to the design system, export them from `web/src/components/ui/index.ts` and use the same token-based approach
- To add a new theme, add a `[data-theme="your-theme"]` block in `app.css` overriding the same CSS custom properties

### UI/UX & design guidelines

- **Produce world-class UI designs** with a focus on usability, aesthetics, and modern design principles
- Implement **subtle micro-interactions** (e.g., button hover effects, and smooth transitions)
- Ensure **clean typography, spacing, and layout balance** for a refined, premium look
- Focus on **delightful details** like hover effects, loading states, and smooth page transitions

---

## Backend (Elixir / Phoenix)

### Phoenix v1.8 guidelines

- **Always** begin your LiveView templates with `<Layouts.app flash={@flash} ...>` which wraps all inner content
- The `MyAppWeb.Layouts` module is aliased in the `my_app_web.ex` file, so you can use it without needing to alias it again
- Anytime you run into errors with no `current_scope` assign:
  - You failed to follow the Authenticated Routes guidelines, or you failed to pass `current_scope` to `<Layouts.app>`
  - **Always** fix the `current_scope` error by moving your routes to the proper `live_session` and ensure you pass `current_scope` as needed
- Phoenix v1.8 moved the `<.flash_group>` component to the `Layouts` module. You are **forbidden** from calling `<.flash_group>` outside of the `layouts.ex` module
- Out of the box, `core_components.ex` imports an `<.icon name="hero-x-mark" class="w-5 h-5"/>` component for for hero icons. **Always** use the `<.icon>` component for icons, **never** use `Heroicons` modules or similar
- **Always** use the imported `<.input>` component for form inputs from `core_components.ex` when available. `<.input>` is imported and using it will save steps and prevent errors
- If you override the default input classes (`<.input class="myclass px-2 py-1 rounded-lg">)`) class with your own values, no default classes are inherited, so your custom classes must fully style the input

### Phoenix router guidelines

- Remember Phoenix router `scope` blocks include an optional alias which is prefixed for all routes within the scope. **Always** be mindful of this when creating routes within a scope to avoid duplicate module prefixes.

- You **never** need to create your own `alias` for route definitions! The `scope` provides the alias, ie:

      scope "/admin", AppWeb.Admin do
        pipe_through :browser

        live "/users", UserLive, :index
      end

  the UserLive route would point to the `AppWeb.Admin.UserLive` module

- `Phoenix.View` no longer is needed or included with Phoenix, don't use it

---

## Elixir guidelines

- Elixir lists **do not support index based access via the access syntax**

  **Never do this (invalid)**:

      i = 0
      mylist = ["blue", "green"]
      mylist[i]

  Instead, **always** use `Enum.at`, pattern matching, or `List` for index based list access, ie:

      i = 0
      mylist = ["blue", "green"]
      Enum.at(mylist, i)

- Elixir variables are immutable, but can be rebound, so for block expressions like `if`, `case`, `cond`, etc
  you *must* bind the result of the expression to a variable if you want to use it and you CANNOT rebind the result inside the expression, ie:

      # INVALID: we are rebinding inside the `if` and the result never gets assigned
      if connected?(socket) do
        socket = assign(socket, :val, val)
      end

      # VALID: we rebind the result of the `if` to a new variable
      socket =
        if connected?(socket) do
          assign(socket, :val, val)
        end

- **Never** nest multiple modules in the same file as it can cause cyclic dependencies and compilation errors
- **Never** use map access syntax (`changeset[:field]`) on structs as they do not implement the Access behaviour by default. For regular structs, you **must** access the fields directly, such as `my_struct.field` or use higher level APIs that are available on the struct if they exist, `Ecto.Changeset.get_field/2` for changesets
- Elixir's standard library has everything necessary for date and time manipulation. Familiarize yourself with the common `Time`, `Date`, `DateTime`, and `Calendar` interfaces by accessing their documentation as necessary. **Never** install additional dependencies unless asked or for date/time parsing (which you can use the `date_time_parser` package)
- Don't use `String.to_atom/1` on user input (memory leak risk)
- Predicate function names should not start with `is_` and should end in a question mark. Names like `is_thing` should be reserved for guards
- Elixir's builtin OTP primitives like `DynamicSupervisor` and `Registry`, require names in the child spec, such as `{DynamicSupervisor, name: MyApp.MyDynamicSup}`, then you can use `DynamicSupervisor.start_child(MyApp.MyDynamicSup, child_spec)`
- Use `Task.async_stream(collection, callback, options)` for concurrent enumeration with back-pressure. The majority of times you will want to pass `timeout: :infinity` as option

---

## Ecto guidelines

- **Always** preload Ecto associations in queries when they'll be accessed in templates, ie a message that needs to reference the `message.user.email`
- Remember `import Ecto.Query` and other supporting modules when you write `seeds.exs`
- `Ecto.Schema` fields always use the `:string` type, even for `:text`, columns, ie: `field :name, :string`
- `Ecto.Changeset.validate_number/2` **DOES NOT SUPPORT the `:allow_nil` option**. By default, Ecto validations only run if a change for the given field exists and the change value is not nil, so such as option is never needed
- You **must** use `Ecto.Changeset.get_field(changeset, :field)` to access changeset fields
- Fields which are set programatically, such as `user_id`, must not be listed in `cast` calls or similar for security purposes. Instead they must be explicitly set when creating the struct
- **Never** use `mix ecto.gen.migration` directly — this project uses Ash-managed migrations

---

## Ash migration guidelines

This project uses Ash Framework's migration tooling instead of raw Ecto migrations.

- **Always** use the two-step Ash workflow to generate and run migrations:
  1. `mix ash.codegen descriptive_name_in_snake_case` — generates migrations and resource snapshots. In dev, this rolls back dev migrations and squashes them into the new named migration
  2. `mix ash.migrate` — runs the generated migrations
- **Never** use `mix ecto.gen.migration` or `mix ash_postgres.generate_migrations` directly — `mix ash.codegen` wraps these and handles snapshot management correctly
- Use a descriptive name for the codegen step, e.g. `mix ash.codegen add_posts_resource` or `mix ash.codegen separate_profile_from_user`
- If you need to reset the database entirely (e.g. during development), use `mix ecto.reset`

---

## Mix guidelines

- Read the docs and options before using tasks (by using `mix help task_name`)
- To debug test failures, run tests in a specific file with `mix test test/my_test.exs` or run all previously failed tests with `mix test --failed`
- `mix deps.clean --all` is **almost never needed**. **Avoid** using it unless you have good reason

---

## Test guidelines

- **Always use `start_supervised!/1`** to start processes in tests as it guarantees cleanup between tests
- **Avoid** `Process.sleep/1` and `Process.alive?/1` in tests
  - Instead of sleeping to wait for a process to finish, **always** use `Process.monitor/1` and assert on the DOWN message:

      ref = Process.monitor(pid)
      assert_receive {:DOWN, ^ref, :process, ^pid, :normal}

   - Instead of sleeping to synchronize before the next call, **always** use `_ = :sys.get_state/1` to ensure the process has handled prior messages