"use client";
import React, { useState, useEffect, useCallback, useRef, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Image from 'next/image';

import { IArticle } from "@/interfaces/article.interface";
import { AiOutlineEdit } from "react-icons/ai";
import { BsBodyText } from "react-icons/bs";
import { AiOutlineFolderOpen } from "react-icons/ai";
import { RiImageEditLine } from "react-icons/ri";

import Preview from "@/components/PreviewText";
import TextEditor from "@/components/textEditor";
import Loading from '@/components/Loading';
import editArtical from "@/services/editArticle";

export default function EditArticle({ params }: { params: any }) {
 const { data: session }: any = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });


  const id: number = params.id;
  const [article, setArticle] = useState<IArticle | null>(null);
  const [imageUrl, setImageUrl] = useState<object>({});
  const [previewImage, setPreviewImage] = useState<string>("");
  const [previewText, setPreviewText] = useState<boolean>(false)
  const [title, setTitle] = useState<string>("");
  const [doc, setDoc] = useState<string>('');
  const handleDocChange = useCallback((newDoc: any) => {
    setDoc(newDoc);
  }, []);
  const inputRef= useRef<HTMLInputElement>(null);

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
  }, [id]);

  useEffect(()=>{
    if(article != null && article.content){
        setDoc(article.content)
    }
    
    if(article !=null && article.image){
      setPreviewImage(`http://localhost:8080/` + article.image)
    }
  },[article])

  const handleArticleSubmit = async (e:any) => {
     e.preventDefault();
    const token: string = session.user.token;
    try{
      const res = await editArtical({
      id: id,
      token: token,
      imageUrl:imageUrl,
      title: title,
      doc: doc,
      });
        console.log('re--->',res)
    	return res;
    } catch(error){
	console.log("Error:", error)
    }
  };
  const handleImageClick = ()=>{
      console.log('hiii')
    if(inputRef.current){
      inputRef.current.click();
    }
  }
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setPreviewImage(url);
      setImageUrl(file);
    }

  };
   const handleTextPreview = (e: any) => {
    e.preventDefault();
    setPreviewText(!previewText);
    console.log('hello from preview!')
  };
 
  if(!article) return <Loading/>
  if(article?.content)
  return (
    <section className='w-full h-full min-h-screen relative py-8'>
      {previewText && (
        <div className="absolute right-16 top-5 p-5 border-2 border-slate-500 bg-slate-100 rounded-xl w-full max-w-[33em] z-30">
          <Preview
            doc={doc}
            title={title}
            previewImage={previewImage}
            onPreview={() => setPreviewText(!previewText)}
          />
        </div>
      )}

      <div className='relative mx-auto max-w-[700px] h-full min-h-[90%] w-full p-2 border-2 border-slate-200 rounded-md  bg-white drop-shadow-md flex flex-col gap-2'>
        <form className='relative mx-auto max-w-[700px] h-full min-h-[90%] w-full p-2 border-2 border-slate-200 rounded-md  bg-slate-50 drop-shadow-md flex flex-col gap-2 '>
          {" "}
          <div className='flex justify-between items-center'>
            <button
              className='border-b-2 rounded-md border-slate-500 p-2 flex items-center gap-2  hover:border-slate-400 hover:text-slate-800'
              onClick={handleTextPreview}
            >
              <BsBodyText />
              Preview
            </button>{" "}
            <button
              className='group border border-b-2 border-slate-500 rounded-md p-2 flex items-center gap-2 hover:border-slate-400 hover:text-slate-800 '
              onClick={handleArticleSubmit}
            >
                edite artigo 
              <AiOutlineEdit className='w-5 h-5 group-hover:text-red-500' />
            </button>
          </div>
          <div className='header-wrapper flex flex-col gap-2 '>
            <div className='image-box'>
              {previewImage.length === 0 && (
                <div className='select-image'>
                  <label
                    htmlFor='image'
                    className='p-4 border-dashed border-4 border-slate-400 cursor-pointer flex flex-col items-center justify-center'
                  >
                    <AiOutlineFolderOpen className='w-7 h-7' />
                    drang and drop image
                  </label>
                  <input
                    id='image'
                    name='thumb'
                    type='file'
                    multiple
                    className='w-full h-5'
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                  />
                </div>
              )}
              {previewImage.length > 0 && (
                <div className='w-full h-[10em] relative'>
                  <div className='absolute top-0 left-0 w-full h-full cursor-pointer transition-opacity bg-transparent hover:bg-[#00000036] z-30'onClick={handleImageClick} />
                  <RiImageEditLine className='w-[3em] h-[3em] absolute right-1 z-30 text-slate-300' />
                  <Image
                    alt='prev-image'
                    layout='fill'
                    className='w-[10em] h-[10em] object-cover bg-center bg-no-repeat'
                    src={previewImage}
                  />
                  <input
                    id='image'
                    name='thumb'
                    type='file'
                    multiple
                    ref={inputRef}
                    className='w-full h-full' 
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                  />
                </div>
              )}
            </div>

            <div className='flex justify-between w-full'>
              <input
                name='title'
                type='text'
                placeholder='Título'
                defaultValue={article?.title}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setTitle(e.target.value)
                }
                className='border-x-2 border-b w-full p-2'
              />
            </div>
          </div>
         {doc &&(<TextEditor initialDock={doc} onChange={handleDocChange} />)} 
        </form>
      </div>
    </section>
  );

  else return  null
}
