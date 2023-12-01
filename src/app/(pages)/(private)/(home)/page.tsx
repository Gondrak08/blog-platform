import ArticleList from "@/components/ArticlesList";
export default function Home() {
  return (
    <main className="flex flex-col  min-h-screen w-full  px-24">
      <section className="w-full h-full min-h-[92vh]">
        <ArticleList />
      </section>
    </main>
  );
}
