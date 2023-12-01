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
