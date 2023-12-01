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
