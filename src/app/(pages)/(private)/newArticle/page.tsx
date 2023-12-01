"use client";
import React, { ChangeEvent, useCallback, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import postArtical from "@/services/postArticle";
import { AiOutlineFolderOpen } from "react-icons/ai";
import { RiImageEditLine } from "react-icons/ri";

import Image from "next/image";
import TextEditor from "@/components/textEditor";
import Preview from "@/components/PreviewText";
import { AiOutlineSend } from "react-icons/ai";
import { BsBodyText } from "react-icons/bs";

export default function NewArticle(params:any) {
  const { data: session }: any = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });
  const [imageUrl, setImageUrl] = useState<object>({});
  const [previewImage, setPreviewImage] = useState<string>("");
  const [previewText, setPreviewText] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [doc, setDoc] = useState<string>("# Escreva o seu artigo... \n");
  const handleDocChange = useCallback((newDoc: any) => {
    setDoc(newDoc);
  }, []);

  if(!session?.user) return null;

  const handleArticleSubmit = async (e:any) => {
    e.preventDefault();
    const token: string = session.user.token;
    try {
      const res = await postArtical({
        id: session.user.userId.toString(),
        token: token,
        imageUrl: imageUrl,
        title: title,
        doc: doc,
      });
      console.log('re--->', res);
      redirect('/success');
      // return res;
    } catch (error) {
      console.error('Error submitting article:', error);
      // Handle error if needed
      throw error;
    }
  };

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
  };
  return (
    <section className="w-full h-full min-h-screen relative py-8">
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

      <form className="relative mx-auto max-w-[700px] h-full min-h-[90%] w-full p-2 border-2 border-slate-200 rounded-md  bg-slate-50 drop-shadow-xl flex flex-col gap-2 ">
        {" "}
        <div className="flex justify-between items-center">
          <button
            className="border-b-2 rounded-md border-slate-500 p-2 flex items-center gap-2  hover:border-slate-400 hover:text-slate-800"
            onClick={handleTextPreview}
          >
            <BsBodyText />
            Preview
          </button>{" "}
          <button
            className="group border border-b-2 border-slate-500 rounded-md p-2 flex items-center gap-2 hover:border-slate-400 hover:text-slate-800 "
            onClick={handleArticleSubmit}
            type="submit"
          >
            Enviar texto
            <AiOutlineSend className="w-5 h-5 group-hover:text-red-500" />
          </button>
        </div>
        <div className="header-wrapper flex flex-col gap-2 ">
          <div className="image-box">
            {previewImage.length === 0 && (
              <div className="select-image">
                <label
                  htmlFor="image"
                  className="p-4 border-dashed border-4 border-slate-400 cursor-pointer flex flex-col items-center justify-center"
                >
                  <AiOutlineFolderOpen className="w-7 h-7" />
                  Arraste a sua imagem aqui
                </label>
                <input
                  id="image"
                  name="thumb"
                  type="file"
                  multiple
                  className="w-full h-5"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
              </div>
            )}
            {previewImage.length > 0 && (
              <div className="w-full h-[10em] relative">
                <div className="absolute top-0 left-0 w-full h-full cursor-pointer transition-opacity bg-transparent hover:bg-[#00000036] z-30" />
                <RiImageEditLine className="w-[3em] h-[3em] absolute right-1 z-30 text-slate-300 " />
                <Image
                  alt="prev-image"
                  layout="fill"
                  className="w-[10em] h-[10em] object-cover bg-center bg-no-repeat "
                  src={previewImage}
                />
              </div>
            )}
          </div>

          <div className="flex justify-between w-full">
            <input
              name="title"
              type="text"
              placeholder="Título"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setTitle(e.target.value)
              }
              className="border-x-2 border-b w-full p-2"
            />
          </div>
        </div>
        <TextEditor initialDock={doc} onChange={handleDocChange} />
      </form>
    </section>
  );
}
