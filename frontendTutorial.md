# Apresentação

Olá, como vai? Aqui é o Vítor, retornando com um novo projeto para ajudá-lo a aprimorar suas habilidades de programador. Já faz um tempo desde que publiquei um tutorial. Nos últimos meses, tirei um tempo para descansar e me dedicar a outras atividades. Durante esse período, desenvolvi um pequeno projeto web: um blog, que se tornou o foco deste tutorial.

Neste guia, vamos criar o frontend de uma página de blog. A aplicação incluirá rotas públicas e privadas, autenticação de usuário, e a capacidade de escrever texto em Markdown, com a adição de fotos, exibição de artigos e muito mais.

Sinta-se à vontade para personalizar a sua aplicação da maneira que preferir, até mesmo eu incentivo isso.

Espero que você se divirta.

Bom código.

## Bibliotecas

Aqui está o resumo das bibliotecas usadas neste projeto.
- [next-auth](https://next-auth.js.org/) - biblioteca de autenticação para Next.js
- [github.com/markdown-it/markdown-it](https://github.com/markdown-it/markdown-it) - markdown biblioteca.
- [github.com/sindresorhus/github-markdown-css](https://github.com/sindresorhus/github-markdown-css)- Para dar estilo ao nosso editor markdown.
- [github.com/remarkjs/react-markdown](https://github.com/remarkjs/react-markdown) - Biblioteca para renderizar markdown em nosso componente react.
- [github.com/remarkjs/remark-react/tree/4722bdf](https://github.com/remarkjs/remark-react/tree/4722bdf) - Plugin para transformar Markdown em React.
- [codemirror.net](https://codemirror.net/docs/) - Editor componente para web.
- [react-icons](https://react-icons.github.io/react-icons/) - lib de icones para react.

## Criando projeto React.
Vamos utilizar a versão mais recente do framework [Next.js](https://nextjs.org/docs), que, no momento da redação deste tutorial, é a versão 13.4.

Execute o seguinte comando para criar o projeto:

```
npx create-next-app myblog
```
Durante a instalação, selecione as configurações do template. Neste tutorial,usarei TypeScript como linguagem e o framework de CSS, Tailwind CSS, para o estilo da nossa aplicação.

## Configuração

Agora vamos instalar todas as bibliotecas que faremos uso.

##### Markdown

```
npm i  markdown-it @types/markdown-it markdown-it-style github-markdown-css react-markdown
```

##### React Remark

```
remark remark-gfm remark-react
```

##### Codemirror

```
npm @codemirror/commands @codemirror/highlight @codemirror/lang-javascript @codemirror/lang-markdown @codemirror/language @codemirror/language-data @codemirror/state @codemirror/theme-one-dark @codemirror/view
```

##### Icons

```
npm i react-icons @types/react-icons
```

Depois limpe a estrutura inicial da sua instalação, jogando fora tudo aquilo que não iremos usar.

## Arquitetura

Assim é a estrutura final de nossa aplicação.

```
src-
  |- app/
  |    |-(pages)/
  |    |      |- (private)/
  |    |      |       |- (home)
  |    |      |       |- editArticle/[id]
  |    |      |       |
  |    |      |       |- newArticle
  |    |      | - (public)/
  |    |              | - article/[id]
  |    |              | - login
  |    |
  |   api/
  |    |- auth/[...nextAuth]/route.ts
  |    |- global.css
  |    |- layout.tsx
  |
  | - components/
  | - context/
  | - interfaces/
  | - lib/
  | - services/
middleware.ts
```

## Primeiros passos

#### Configurando next.config
Na raiz do projeto, no arquivo next.config.js, vamos configurar o endereço do domínio de onde iremos acessar as imagens dos nossos artigos. Para este tutorial, ou se estiver usando um servidor local, utilizaremos localhost.

Certifique-se de incluir essa configuração para garantir o correto carregamento das imagens em sua aplicação.
```js
const nextConfig = {
   images: {
    domains: ["localhost"],
  },
};
```
#### Configurando Middleware
 Na pasta raíz da aplicação `src/`,crie um `middleware.ts` para verificar o acesso às rotas privadas. 
```typescript
export { default } from "next-auth/middleware";
export const config = {
  matcher: ["/", "/newArticle/", "/article/", "/article/:path*"],
};
```
Para saber mais sobre middlewares e tudo o que você pode fazer com ele, acesse a [documentação](https://next-auth.js.org/tutorials/securing-pages-and-api-routes)

#### Configurando Rota de Autenticação. 
Dentro da pasta /app, crie um arquivo chamado route.ts em `api/auth/[...nextauth]`. Ele conterá a configuração de nossas rotas, conectando-se à nossa API de autenticação usando o CredentialsProvider.

O `CredentialsProvider` permite que você lide com o *login* usando credenciais arbitrárias, como nome de usuário e senha, domínio ou autenticação de dois fatores ou dispositivo de hardware etc.

Primeiramente, na raiz do seu projeto, crie um arquivo `.env.local` e adicione um `token` que será usado como o nosso *secret*.

```
.env.local
NEXTAUTH_SECRET = SubsTituaPorToken
```
Em seguida, vamos escrever nosso sistema de autenticação, onde esse `NEXTAUTH_SECRET` será adicionado ao nosso secret no arquivo `src/app/auth/[...nextauth]/routes.ts`.
```tsx
import NextAuth from "next-auth/next";
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authenticate } from "@/services/authService";
import refreshAccessToken from "@/services/refreshAccessToken";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {
          name: "email",
          label: "email",
          type: "email",
          placeholder: "Email",
        },
        password: {
          name: "password",
          label: "password",
          type: "password",
          placeholder: "Password",
        },
      },
      async authorize(credentials, req) {
        if (typeof credentials !== "undefined") {
          const res = await authenticate({
            email: credentials.email,
            password: credentials.password,
          });
          if (typeof res !== "undefined") {
            return { ...res };
          } else {
            return null;
          }
        } else {
          return null;
        }
      },
    }),
  ],

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }: any) {
      if (user && account) {
        return {
          token: user?.token,
          accessTokenExpires: Date.now() + parseInt(user?.expiresIn, 10),
          refreshToken: user?.tokenRefresh,
        };
      }

      if (Date.now() < token.accessTokenExpires) {
        return token;
      } else {
        const refreshedToken = await refreshAccessToken(token.refreshToken);
        return {
          ...token,
          token: refreshedToken.token,
          refreshToken: refreshedToken.tokenRefresh,
          accessTokenExpires:
            Date.now() + parseInt(refreshedToken.expiresIn, 10),
        };
      }
    },
    async session({ session, token }) {
      session.user = token;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    signOut: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

#### Provedor de Autenticação
Vamos criar um provedor de autenticação, um context, que irá compartilhar os dados do nosso usuário pelas páginas da nossa rota privada. Vamos utilizá-lo posteriormente para encapsular um de nossos layout.tsx.

Crie um arquivo em src/context/auth-provider.tsx com o seguinte conteúdo:

```tsx
'use client';
import React from 'react';
import { SessionProvider } from "next-auth/react";
export default function Provider({
    children,
    session
}: {
    children: React.ReactNode,
    session: any
}): React.ReactNode {
    return (
        <SessionProvider session={session} >
            {children}
        </SessionProvider>
    )
};
```
#### Estilo Globais
No geral, em nossa aplicação, usaremos o Tailwind CSS para criar nosso estilo. No entanto, em alguns lugares, iremos compartilhar classes de CSS personalizadas entre páginas e componentes.


```css
/*global.css*/
.container {
  max-width: 1100px;
  width: 100%;
  margin: 0px auto;
}

.image-container {
  position: relative;
  width: 100%;
  height: 5em;
  padding-top: 56.25%; /* Aspect ratio 16:9 (dividindo a altura pela largura) */
}

.image-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@keyframes spinner {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 10px solid #f3f3f3;
  border-top: 10px solid #293d71;
  border-radius: 50%;
  animation: spinner 1.5s linear infinite;
}
```

## Layouts
agora vamos escrever os layouts, privados e públcios.
#### app/layout.tsx
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Provider from "@/context/auth-provider";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Markdown Text Editor",
  description: "Created by <@vitorAlecrim>",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  return (
    <Provider session={session}>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </Provider>
  );
}
```
#### pages/layout.tsx
```tsx
import Navbar from "@/components/Navbar";
export default function PrivatePagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="w-full  ">
        <Navbar />
      </header>
      <div className="container">{children}</div>
    </>
  );
}
```

## Chamadas para a API
Nossa aplicação fará várias chamadas à nossa API, e você pode adaptar essa aplicação para usar qualquer API externa. No nosso exemplo, estamos utilizando a nossa aplicação local. Caso não tenha visto o tutorial do backend e a criação do servidor, acesse.

Em src/services/, vamos escrever as funções abaixo:

1. `authService.ts`: função responsável por autenticar nosso usuário no servidor. 
```typescript
export const authenticate = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const response = await fetch(`http://localhost:8080/user/login`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });
  const user = await response.json();

  if (!response.ok) {
    throw new Error(user.message);
  }
  if (user) {
    return user;
  }

  return null;
};
```

2.`refreshAccessToken.tsx`:
```typescript
export default async function refreshAccessToken(refreshToken: string) {
  const headers = {
    "Content-Type": "application/json",
  };

  const data = {
    refreshToken: refreshToken,
  };

  try {
    const res = await fetch("http://localhost:8080/user/refresh-token", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });

    console.log("new call token -->", res);
    const token = await res.json();
    return token;
  } catch (error) {
    console.error("error refreshing token", error);
    throw error;
  }
}
```
3. `getArticles.tsx`: função responsável por chamar todos os artigos salvos em nosso banco de dados:
```typescript
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
```
4. `postArtcile.tsx`: função responsável por registrar os dados do artigo em nosso servidor.
```typescript
import { IProp } from "@/interfaces/services.interface";

export default async function postArtical(prop:IProp){
    const {token,title, doc,imageUrl} = prop;
    const formData = new FormData();
    formData.append('title',title);
    formData.append('thumb', imageUrl);
    formData.append('content', doc);
    
    const headers = {
        'x-access-token': token
    };
    
    try{
        const res = await fetch('http://localhost:8080/articles/add',{
            method:'POST',
            headers:headers,
            body:formData
        })
        const result = await res.json();
        return result;
    } catch(error){
        console.log('Error:', error);
        console.log('something wrong just happend', await error);
    }
}
```
5. `editArticle.tsx`: função responsável por modificar um artigo específico dentro do banco de dados.

```Typescript
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
```

6. `deleteArticle.tsx`: função responsável por remover um artigo específico de nosso banco de dados:
```
interface IProp {
  id: number;
  token: string;
}

export default async function deleteArtical(prop: IProp) {
  const { id, token } = prop;

  const headers = {
    "x-access-token": token,
  };

  try {
    const res = await fetch(`http://localhost:8080/articles/delete/${id}`, {
      method: "DELETE",
      headers: headers,
    });
    const result = await res.json();
    return result;
  } catch (error) {
    console.log("Error:", error);
    console.log("something wrong just happend", await error);
  }
}
```

## Componentes
A seguir, vamos escrever cada componente usado durante a aplicação. 

#### Components/Navbar.tsx
Um componente simples com dois links de navegação.


```
import { TfiWrite } from "react-icons/tfi";
import { BsNewspaper } from "react-icons/bs";
import Link from "next/link";
import SignOutButton from "./SignOutButton";
export default function Navbar() {
  const linkStyle = "flex items-center  gap-2 hover:text-slate-600";
  return (
    <section className="container h-fit px-24 py-5">
      <div className="flex items-center justify-between  px-6">
        <div className="flex iems-center gap-8">
          <Link href="/" className={linkStyle}>
            <BsNewspaper className="w-[3em] h-[3em] font-light" />
          </Link>
          <Link href="/newArticle" className={linkStyle}>
            <TfiWrite className="text-sm w-[2.5em] h-[2.5em]" />
            <span className="text-[14px]">Escreva</span>
          </Link>
        </div>
        <SignOutButton />
      </div>
    </section>
  );
}
```

#### Components/ Loading.tsx
Um componente simples de loading, usado durante a espera das chamadas de API.


```tsx
export default function Loading() {
  return (
    <div className="loading-container w-full h-fit flex items-center justify-center">
      <div className="spinner-container">
        <div className="loading-spinner"></div>
      </div>
    </div>
  );
}

```

#### Components/ Pagination.tsx
Um componente de paginação usado em nossa página de exibição de todos os nossos artigos, em nossa rota privada. Você pode encontrar um artigo mais detalhado sobre a escrita deste componente[aqui](https://www.linkedin.com/pulse/tutorial-criando-um-sistema-de-pagina%25C3%25A7%25C3%25A3o-em-reactjs-vitor-alecrim/?trackingId=%2F0Q3Rl4V%2By3PDpLM5I7FNA%3D%3D)

```tsx
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

interface IPagination {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
}

export default function Pagination(props: IPagination) {
  const { currentPage, totalPages, onPageChange } = props;

  const handlePrevClick = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const visiblePageCount = 4;
    const pageNumbers: number[] = [];

    if (totalPages <= visiblePageCount) {
      pageNumbers.push(...Array.from({ length: totalPages }, (_, i) => i + 1));
    } else {
      const firstPage = 0;
      const lastPage = totalPages - 1;

      const midPageCount = visiblePageCount - 2;

      const step = Math.floor(midPageCount / 2);
      pageNumbers.push(firstPage);

      if (currentPage < firstPage + step) {
        pageNumbers.push(...Array.from({ length: Math.min(midPageCount, totalPages) }, (_, i) => firstPage + i + 1));
      } else if (currentPage > lastPage - step) {
        pageNumbers.push(...Array.from({ length: Math.min(midPageCount, totalPages) }, (_, i) => lastPage - midPageCount + i));
      } else {
        const start = currentPage - step;
        pageNumbers.push(...Array.from({ length: midPageCount }, (_, i) => start + i + 1));
      }

      pageNumbers.push(lastPage + 1);
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex mx-auto w-fit">
      <ul id="pagination" className="flex items-center font-epilogue font-[500] text-[14px] border border-mv-gray-300 rounded-xl">
        <li className="border-r-[1px] border-r-mv-gray-300">
          <button
            className={`page-item text-sm md:text-md p-2 rounded-md flex items-center gap-3
              ${currentPage === 0 ? 'disable cursor-not-allowed text-mv-blue-200' : 'text-mv-blue-600'}`}
            onClick={handlePrevClick}
            disabled={currentPage === 0}
          >
            <FaArrowLeft className="text-mv-blue-200" />
            Anterior
          </button>
        </li>

        <div className="flex h-full w-full items-center justify-center">
          {pageNumbers.map((pageNumber) => (
            <li
              key={pageNumber - 1} 
              className={`page-item flex items-center w-full h-full border-r-[1px] border-r-mv-gray-300 last:border-r-0
                            ${pageNumber === currentPage + 1 ? 'active text-mv-blue-600' : 'text-mv-blue-200'}`}
            >
              <button className="page-link w-full h-full px-4" onClick={() => onPageChange(pageNumber - 1)}>
                {pageNumber}
              </button>
            </li>
          ))}
        </div>

        <li className="border-l-[1px] border-r-mv-gray-300">
          <button
            className={`page-item text-sm md:text-md p-2 rounded-md flex items-center gap-3 font- ${currentPage === totalPages - 1 ? 'disable cursor-not-allowed text-mv-blue-200' : '  text-mv-blue-600'
              }`}
            onClick={handleNextClick}
            disabled={currentPage === totalPages - 1}
          >
            Próxima
            <FaArrowRight className="text-mv-blue-200" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
```

#### Components/ SignOutButton
Componente botão para retirada de usuário da aplicação.
```tsx
"use client";
import React from "react";
import { signOut } from "next-auth/react";
import { BiExit } from "react-icons/bi";

const SignOutButton = () => {
  return (
    <div className="h-fit w-fit flex items-center gap-1">
      sair
      <BiExit
        className="text-slate-500 hover:text-slate-600 w-7 h-7 cursor-pointer"
        onClick={() => {
          signOut({ redirect: true, callbackUrl: "/login" });
        }}
      />
    </div>
  );
};

export default SignOutButton;
```

#### Components/ ArticleCard.tsx
Cartão de exibição dos artigos escritos.
Este componente também contém um link que levará tanto à página de exibição do artigo quanto à página de edição de um artigo previamente escrito.


```tsx
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
```

#### Components/ PreviewText.tsx
Componente responsável por exibir o texto que estamos escrevendo em nosso editor Ele faz uso de uma biblioteca diferente da  `article`. Caso queira, você pode adaptar o componente para usar a mesma biblioteca. 

```typescript
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
    .use(remarkReact, React)
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
```

#### Components/ ArticleList.tsx
Componente responsável por executar chamadas de api e a exibição do retorno de sua resposta. 
Aqui faremos uso de duas chamadas de api através das funções que escrevemos:
  1. `getArticles.ts` -  nos retorna todos os artigos que serão exibidos no componente.
  2. `removeArticle` - remove um artigo específico de nossa lista e do nosso servidor. 

Faremos uso do componente `Pagination.tsx`, escrito previamente para dividir o número de nossos artigos em páginas. 

```typescript
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import getArticals from "@/services/getArticles";
import { IArticle } from "@/interfaces/article.interface";
import ArticleCard from "./articleCard";
import Pagination from "./Pagination";
import Loading from "./Loading";
import {MdOutlineAutoDelete} from 'react-icons/md'
import deleteArtical from "@/services/deleteArticle";

const ArticleList = () => {
  const linkStyle = "flex items-center  gap-2 hover:text-slate-600";
  const { data: session }: any = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

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
    console.log(deleteArr?.ok);
    if(deleteArr?.ok){
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
    };
    getData();
  }, [articles]);

  if (articles.length === 0) return <Loading />;

  return (
    <section
      className="
      w-full h-full px-5"
    >
      <h1 className="text-2xl text-slate-800 text-bold my-3">Seus textos</h1>
      <div className="w-full border border-slate-300 my-3"/>
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
```

#### Components/ TextEditor.tsx
Para a criação do nosso editor de texto faremos uso da biblioteca `codemirror`.
A biblioteca fará com que o editor possa processar a escrita markdown. 

Começamos importando a biblioteca e em seguida escrevemos o componente.

```typescript
"use client";
import { useCallback, useEffect } from "react";
import useCodeMirror from "@/lib/use-codemirror";

interface Props {
  initialDock: string;
  onChange: (doc: string) => void;
}

const TextEditor: React.FC<Props> = (props) => {
  const { onChange, initialDock } = props;
  const handleChange = useCallback(
    (state: any) => onChange(state.doc.toString()),
    [onChange],
  );
  const [refContainer, editorView] = useCodeMirror<HTMLDivElement>({
    initialDoc: initialDock,
    onChange: handleChange,
  });
  useEffect(() => {
    if (editorView) {
      console.log(editorView);
    }
  }, [editorView]);

  return (
    <section className="h-full w-full">
      <div
        className="editor-wrapper  h-full w-full mx-auto flex flex-col gap-2"
        ref={refContainer}
      />
    </section>
  );
};

export default TextEditor;
```

## Páginas
A seguir, passaremos por cada uma de nossas páginas, divididas por suas respectivas rotas. 
### Públicas
#### Login
Esta é a página inicial de nossa aplicação. Trata-se de uma página simples; você pode modificá-la conforme entender. Nela, faremos uso da função `signin` provida pela biblioteca de navegação `next-auth`.

No arquivo `src/app/pages/public/login/page.tsx`.
```typescript
"use client";
import { ChangeEvent, FormEvent, useState } from "react";
import { signIn } from "next-auth/react";

export default function Page() {
  const inputStyle =
    "p-2 border border-1 border-slate-300 rounded-md text-black";

  const [formValues, setFormValues] = useState<{
    email: string;
    password: string;
  }>({
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value }: { name: string; value: string } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      email: formValues.email,
      password: formValues.password,
      redirect: true,
      callbackUrl: `${window.location.origin}/`,
    });
    console.log("res--->", res);
  };

  return (
    <main className="flex flex-col  min-h-screen w-full  px-24">
      <section className="container mx-auto min-h-screen h-full flex items-center justify-center">
        <div className=" bg-white h-[20em] rounded-md p-3 drop-shadow-md ">
          <div className="flex flex-col gap-2 items-center py-5">
            <h1 className="text-blue-500 text-5xl">W</h1>
            <span className="text-slate-400">Entrar em seu blog</span>
          </div>
          <form
            onSubmit={(e: any) => {
              onSubmit(e);
            }}
            className="w-full flex flex-col gap-2"
          >
            <input
              onChange={(e: any) => handleChange(e)}
              name="email"
              type="email"
              placeholder="Email"
              value={formValues.email}
              className={inputStyle}
            />
            <input
              onChange={(e: any) => handleChange(e)}
              name="password"
              type="password"
              placeholder="Password"
              value={formValues.password}
              className={inputStyle}
            />
            <button className="mt-2 border border-slate-400 hover:bg-blue-500 text-blue-500 hover:text-white w-fit p-2 self-start rounded-md   text-[14px] font-openSans ">
              Entrar
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
``` 
#### Página de Artigo
Para criar a página de leitura de artigos, vamos desenvolver uma página dinâmica.

Toda plataforma de blog que você já acessou provavelmente possui uma página dedicada à leitura de artigos, acessível via URL. A razão para isso é uma rota de página dinâmica. Felizmente, o Next.js facilita isso com seu novo método *AppRouter*, tornando nossa vida muito mais fácil.

Primeiro: precisamos criar a rota em nossa estrutura, adicionando uma pasta `[id]`. Isso resultará na seguinte estrutura, `pages/(public)/articles/[id]/pages.tsx`.

- O `id` corresponde ao slug da nossa rota de navegação.
- `params` é uma propriedade passada através da arvore de nossa aplicação contendo o slug de navegação.
```typescript
export default function Page({ params }: { params: any }) {
  const id: number = params.id;
...
```

Segundo: uso da biblioteca `MarkdownIt`, para que a página exiba o texto em formato markdown.
```ts
import MarkdownIt from "markdown-it";
import "github-markdown-css/github-markdown.css";
```

E por fim,
uma vez a página pronta, ao acessar, por exemplo, `localhost:3000/articles/1` no navegador, você terá acesso ao artigo com o ID fornecido.

No nosso caso, o id será passado através da navegação quando clicarmos em um dos componentes `ArticleCards.tsx`, que serão renderizados na página principal da nossa rota privada.


```ts
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
```
### Privadas
Aqui estão nossas páginas privadas que poderão apenas ser acessadas uma vez que o usuário está autenticado em nossa aplicação. 

#### Home
Dentro da nossa pasta `app/pages/` quando algum arquivo é declarado dentro de `()`, significa que aquela rota é `/`. 

No nosso caso, a pasta `(Home)`, refere-se a página inicial de nossa rota privada. Ela é a primeira página que o usuário ver ao se autenticar no sistema. Essa página irá exibir a lista de artigos de nosso banco de dados.

Os dados serão processados pelo nosso componente ArticlesList.tsx. Se você ainda não escreveu esse código, volte à seção de componentes.

Em `app/(pages)/(private)/(home)/page.tsx`
```ts
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

```
#### Novo Artigo
Essa é uma das páginas mais importantes de nossa aplicação, através delavamos poder registrar os nossos artigos. 
Essa página permitirá o usuário.
1. Escrever um artigo em formato markdown. 
2. Atribuir uma imagem ao artigo. 
3. Acesso a prévia do texto em markdown antes de envia-lo ao servidor.

A página faz uso de alguns *hooks*: 
1. `useCallBack` -  utilizado para memorizar funções.
2. `useState` - permite você adicionar uma *state* variavel ao nosso componente.
3. `useSession` - nos permite saber se o usuário está autenticado, e nos permite obter o `token` de autenticação.

Para isso iremos usar dois componentes:
1. `TextEditor.tsx`: editor de texto que escrevemos previamente. 
2. `Preview.tsx`: componente de exibição de arquivo em formato markdown.

Durante a construção desta página faremos uso da nossa API. 
1. POST: utilizando a nossa função,`postArtical`, vamos enviar o artigo ao servidor. 

Também faremos uso do hook `useSession`, provido pela biblioteca `next-auth`, para obtermos o token de autenticação de usuário que será utilizado para realizarmos o registro do artigo no servidor. 


três chamadas distintas de API.
Em `app/pages/(private)/newArticle/page.tsx`

```typescript
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
  const [doc, setDoc] = useState<string>("# Hello, World! \n");
  const handleDocChange = useCallback((newDoc: any) => {
    setDoc(newDoc);
  }, []);

  if (!session?.user) return null;

  const handleArticleSubmit = async (e:any) => {
    e.preventDefault();
    const token: string = session.user.token;
    const res = await postArtical({
      id:params.id,
      token: token,
      imageUrl: imageUrl,
      title: title,
      doc: doc,
    });
    console.log('re--->',res)
    return res;
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
          >
            Submit text
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
                  drang and drop image
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
```

#### Edição de Artigo.
Página similar a de *Novo Artigo*(`newArticle`), com algumas diferenças.

Primeiro nós definimos uma ronta dinâmica, onde recebemos uma `id` como parâmetro de navegação. Muito similar ao que se fez na página de leitura de artigo. 
`app/(pages)/(private)/editArticle/[id]/page.tsx`

```typescript
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
```

## Conclusão

Primeiramente gostaria de agradecer por ter disponibilizado o seu tempo para ler este tutorial e também gostaria de parabeniza-lo por ter feito este tutorial. Espero que ele tenha lhe servido e tenha sido fácil de seguir o passo a passo. 

Segundo, gostria de comentar alguns pontos sobre o que acabamos de construir. Esse é o básico de um sistema de blogs e falta ainda adicionar muita coisa, como uma página pública de exibição de todos os artigos, ou uma página de registro de novos usuários, ou mesmo uma página pessoal de erro de rota 404. Caso, se durante o tutorial, você se perguntou sobre estas páginas e sentiu a sua falta, saiba que isso foi proposital. Este tutorial lhe deu experiência o bastante para ser capaz de criar essas novas áginas por você mesmo e adicionar muitas outras mais e novas funções. 

No mais, muito obrigado. 
siga-me nas redes sociais


E até a próxima. o/
