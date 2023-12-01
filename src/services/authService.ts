export const authenticate = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const response = await fetch(`http://localhost:8080/user/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });
  const user = await response.json();

  if (!response.ok) {
    throw new Error(user.message);
  }
  if (user) {
    return user;
  }

  return null;
};
