import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { PageProvider } from "@/context/page-context";

export default function WithNavbarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageProvider>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </PageProvider>
  );
}
