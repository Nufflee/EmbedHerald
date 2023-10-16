import { Request, ExecutionContext } from "@cloudflare/workers-types";
import { generateHTML } from "./common.js";

const handler = {
  async fetch(request: Request, env: unknown, ctx: ExecutionContext) {
    if (request.method !== "GET") {
      return new Response("Method not allowed", { status: 405 });
    }

    const url = new URL(request.url);

    if (url.pathname !== "/h") {
      return new Response("Not found", { status: 404 });
    }

    const html = await generateHTML(url.searchParams.get("article"));

    return new Response(html, {
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
      },
    });
  },
};

export default handler;