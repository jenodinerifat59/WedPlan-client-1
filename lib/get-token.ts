
export async function getAuthToken(): Promise<string> {
  const response = await fetch("/api/auth/token", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to get authentication token");
  }

  const data = await response.json();

  if (!data.token) {
    throw new Error("Authentication token not found");
  }

  return data.token;
}
