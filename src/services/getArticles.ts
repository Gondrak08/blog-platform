export default async function getArticals() {
  try {
    const res = await fetch("http://localhost:8080/articles/getAll", {
      cache: "no-cache",
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.log("something wrong just happend", error);
  }
}
