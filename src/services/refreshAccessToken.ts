export default async function refreshAccessToken(refreshToken: string) {
  const headers = {
    "Content-Type": "application/json",
  };

  const data = {
    refreshToken: refreshToken,
  };

  console.log(refreshToken);

  try {
    const res = await fetch("http://localhost:8080/user/refresh-token", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      console.error("Error refreshing token:", res.status, res.statusText);
      throw new Error(
        `Error refreshing token: ${res.status} ${res.statusText}`,
      );
    }

    const newToken = await res.json();
    console.log("New token obtained:", newToken);
    return newToken;
  } catch (error) {
    console.error("error refreshing token", error);
    throw error;
  }
}
