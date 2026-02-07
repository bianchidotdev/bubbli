import createClient, { type Middleware } from "openapi-fetch";
import { getToken } from "../lib/auth";
import type { paths } from "./schema";

const authMiddleware: Middleware = {
  async onRequest({ request }) {
    request.headers.set("Content-Type", "application/vnd.api+json");
    request.headers.set("Accept", "application/vnd.api+json");
    const token = getToken();
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
};

const api = createClient<paths>({});
api.use(authMiddleware);

export default api;
