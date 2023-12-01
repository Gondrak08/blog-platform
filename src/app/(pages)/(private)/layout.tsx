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
