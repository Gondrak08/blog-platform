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
