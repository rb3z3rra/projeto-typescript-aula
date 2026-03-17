import http from "http";

export async function startServer(app: any) {
  const server = http.createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });

  const addressInfo = server.address();

  if (!addressInfo || typeof addressInfo === "string") {
    throw new Error("Não foi possível obter o endereço do servidor de teste");
  }

  const baseUrl = `http://127.0.0.1:${addressInfo.port}`;

  return {
    baseUrl,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      }),
  };
}

export async function httpJson(
  baseUrl: string,
  path: string,
  {
    method = "GET",
    headers = {},
    body,
  }: {
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
  } = {},
) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  return {
    status: response.status,
    data,
    headers: response.headers,
  };
}