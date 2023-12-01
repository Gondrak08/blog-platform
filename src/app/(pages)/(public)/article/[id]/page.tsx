"use client";
import { useState, useEffect } from "react";
import { IArticle } from "@/interfaces/article.interface";
import Image from "next/image";

import MarkdownIt from "markdown-it";
import "github-markdown-css/github-markdown.css";

export default function Page({ params }: { params: any }) {
  const id: number = params.id;
  const [article, setArticle] = useState<IArticle | null>(null);

  const fetchArticle = async (id: number) => {
    try {
      const response = await fetch(
        `http://localhost:8080/articles/getById/${id}`,
      );
      const jsonData = await response.json();
      setArticle(jsonData);
    } catch (err) {
      console.log("something went wrong:", err);
    }
  };

  useEffect(() => {
    if (article !== null || article !== undefined) {
      fetchArticle(id);
    }
  }, [id, article]);

  if (article === null) return null;

  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
  });

  const mdTitle: string = md.render(article.title);
  const mdContent: string = md.render(article.content);

  return (
    <section className="min-h-screen">
      <section className="w-full container mx-auto">
        <div className="container h-[20em] relative ">
          <Image
            src={`http://localhost:8080/` + article?.image}
            alt="hero image"
            fill={true}
            className="w-full h-full z-1 object-cover bg-center bg-no-repeat"
          />
        </div>
        <>
          <div className="markdown-body p-5">
            <div
              className="text-4xl"
              dangerouslySetInnerHTML={{ __html: mdTitle }}
            />
            <div dangerouslySetInnerHTML={{ __html: mdContent }} />
          </div>
        </>
      </section>
    </section>
  );
}
