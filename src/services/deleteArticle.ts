interface IProp {
  id: number;
  token: string;
}

export default async function deleteArtical(prop: IProp) {
  const { id, token } = prop;

  const headers = {
    "x-access-token": token,
  };

  try {
    const res = await fetch(`http://localhost:8080/articles/delete/${id}`, {
      method: "DELETE",
      headers: headers,
    });
    const result = await res.json();
    return result;
  } catch (error) {
    console.log("Error:", error);
    console.log("something wrong just happend", await error);
  }
}
