export { default } from "next-auth/middleware";
export const config = {
  matcher: ["/", "/newArticle/", "/article/", "/article/:path*"],
};
