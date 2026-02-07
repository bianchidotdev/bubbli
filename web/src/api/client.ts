import createClient from "openapi-fetch";

// TODO: Import generated schema types once the backend OpenAPI endpoint is live.
// Run `bun run generate-api` to generate src/api/schema.d.ts from the Phoenix API.
//
// import type { paths } from "./schema";
// const api = createClient<paths>({ baseUrl: "/api" });

const api = createClient({ baseUrl: "/api" });

export default api;
