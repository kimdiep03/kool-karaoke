import staticFiles from "https://deno.land/x/static_files@1.1.6/mod.ts"

const serveFiles = (req: Request) => staticFiles ('public') ({ 
    request: req, 
    respondWith: (r: Response) => r 
})

const port = Number(Deno.env.get("PORT")) || 8000;

Deno.serve({ port }, (req) => serveFiles (req))