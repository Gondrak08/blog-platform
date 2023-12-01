import { IProp } from "@/interfaces/services.interface";

export default async function editArtical(prop: IProp) {
  const { id, token, imageUrl, title, doc } = prop;
  const formData = new FormData();
  formData.append("title", title);
  formData.append("thumb", imageUrl);
  formData.append("content", doc);

  const headers = {
    "x-access-token": token,
  };

  try {
    const res = await fetch(`http://localhost:8080/articles/edit/${id}`, {
      method: "PATCH",
      headers: headers,
      body: formData,
    });
    const result = await res.json();
    return result;
  } catch (error) {
    console.log("Error:", error);
    console.log("something wrong just happend", await error);
    throw error;
  }
}
