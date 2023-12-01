import Image from "next/image";
import MarkdownIt from "markdown-it";
import Link from "next/link";
import { AiOutlineEdit } from "react-icons/ai";

export interface IArticleCard {
  id: number;
  title: string;
  description: string | null;
  image: string;
  link: string;
}

export default function ArticleCard({
  id,
  title,
  description,
  image,
}: IArticleCard) {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
  });
  const mdTitle = md.render(title);
  const mdDescription = description && md.render(description);
  return (
    <div id="article-card" className="w-full h-full relative ">
      <Link
        href={`editArticle/${id}`}
        className="w-fit h-fit absolute z-30 top-3 right-3"
      >
        <AiOutlineEdit className="w-8 h-8  text-white hover:text-yellow-200" />
      </Link>

      <Link
        href={`article/${id}`}
        rel="noopener noreferrer"
        className="flex flex-col gap-2 w-full h-full shadow-xl hover:shadow-2xl z-10"
      >
        <div className="image-container relative">
          <Image
            src={image}
            alt={title}
            className="absolute object-contain w-full h-full"
            fill
          />
        </div>
        <div className="p-2 h-full relative">
          <div
            className="text-sm md:text-[15px]"
            dangerouslySetInnerHTML={{ __html: mdTitle }}
          />
          {mdDescription && (
            <div dangerouslySetInnerHTML={{ __html: mdDescription }} />
          )}
        </div>
      </Link>
        </div>
  );
}
