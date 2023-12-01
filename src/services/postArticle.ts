import { IProp } from "@/interfaces/services.interface";
export default async function postArtical(prop: IProp) {
  const { id, token, title, doc, imageUrl } = prop;
  const formData = new FormData();
  formData.append("userId", id as unknown as string); // because we know that in the server a int id is expected;
  formData.append("title", title);
  formData.append("thumb", imageUrl);
  formData.append("content", doc);

  const headers = {
    "x-access-token": token,
  };

  try {
    const res = await fetch("http://localhost:8080/articles/add", {
      method: "POST",
      headers: headers,
      body: formData,
    });
    const result = await res.json();
    return result;
  } catch (error) {
    console.log("Error:", error);
    console.log("something wrong just happend", await error);
  }
}
