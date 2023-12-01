import React from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkReact from "remark-react";
import Image from "next/image";
interface Props {
  doc: string;
  title: string;
  previewImage: string;
  onPreview: () => void;
}
const Preview: React.FC<Props> = (props) => {
  const md: any = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkReact as any, React)
    .processSync(props.doc).result;

  return (
    <section className='h-[50em] w-full flex flex-col gap-5'>
      <div className='w-full'>
        <button onClick={() => props.onPreview()}>X</button>
      </div>
      {props.previewImage.length > 0 && (
        <div className='w-full h-[10em] relative'>
          <Image
            alt='prev-image'
            layout='fill'
            className='w-[10em] h-[10em] object-cover bg-center bg-no-repeat absolute'
            src={props.previewImage}
          />
        </div>
      )}
      <div className='w-full h-full'>
        <div className=''>
          <h1 className='text-black text-2xl'>{props.title}</h1>
        </div>
        <div className='preview markdown-body text-black h-full'>
          Preview {md}{" "}
        </div>
      </div>
    </section>
  );
};
export default Preview;
