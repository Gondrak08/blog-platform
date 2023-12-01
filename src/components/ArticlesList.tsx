"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import getArticals from "@/services/getArticles";
import { IArticle } from "@/interfaces/article.interface";
import ArticleCard from "./articleCard";
import Pagination from "./Pagination";
import Loading from "./Loading";
import { MdOutlineAutoDelete } from "react-icons/md";
import deleteArtical from "@/services/deleteArticle";

const ArticleList = () => {
  const { data: session }: any = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });
  const [isApiBeingCalled, setIsApiBeingCalled] = useState<Boolean>(false);
  const [isArticlesListEmpty, setIsArticlesListEmpty] = useState<Boolean>(false)
  const [articles, setArticles] = useState<IArticle[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  const itemsPerPage: number = 10;
  const paginatedItems: any[] = [];

  for (let i = 0; i < articles.length; i += itemsPerPage) {
    paginatedItems.push(articles.slice(i, i + itemsPerPage));
  }

  const articlesToDisplay = paginatedItems[currentPage]?.slice(0, 8);

  async function removeArticle(id: number) {
    const token: string = session?.user?.token;
    const deleteArr = await deleteArtical({ id, token });
    if (deleteArr?.ok) {
      const filter = articles.filter((article: IArticle, index: number) =>
        article.id !== id ? id : null,
      );
      setArticles(filter);
    }
  }
  
  useEffect(() => {
    const getData = async () => {
      const data = await getArticals();
      setArticles(data.reverse());
       if(data.length === 0) setIsArticlesListEmpty(true);
    };
    getData();
  }, [articles]);

  if (articles.length === 0 && !isArticlesListEmpty ) return <Loading />;
  if (articles.length === 0 && isArticlesListEmpty ) return <h1>Você não tem nenhum artigo</h1>

  return (
    <section
      className="
      w-full h-full px-5"
    >
      <h1 className="text-2xl text-slate-800 text-bold my-3">Seus textos</h1>
      <div className="w-full border border-slate-300 my-3" />
      <div className="h-full grid md:grid-cols-2 lg:grid-cols-3  xl:grid-cols-4 md:gap-2 xl:gap-3 ">
        {Array.isArray(articlesToDisplay) &&
          articlesToDisplay.map((article: IArticle, index: number) => {
            return (
              <div key={index} className="relative w-full h-full">
                <ArticleCard
                  id={article.id}
                  image={`http://localhost:8080/` + article.image}
                  description={article.content}
                  title={article.title}
                  key={index}
                  link={"#"}
                />{" "}
                <div
                  onClick={() => removeArticle(article.id)}
                  className="absolute right-2 bottom-2 z-30 w-fit h-fit"
                >
                  <MdOutlineAutoDelete className="w-5 h-5 hover:text-red-500" />
                </div>
              </div>
            );
          })}
      </div>

      <div className="w-full py-5  border border-transparent border-t-mv-gray-200">
        <Pagination
          currentPage={currentPage}
          totalPages={paginatedItems.length}
          onPageChange={handlePageChange}
        />
      </div>
    </section>
  );
};
export default ArticleList;
