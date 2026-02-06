import { ReactNode } from "react";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {children}
      </main>
      <footer className="border-t border-border mt-24">
        <div className="container-wide py-12">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} Böcker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
