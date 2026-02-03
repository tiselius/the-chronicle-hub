import { Link, useLocation } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";

const Header = () => {
  const location = useLocation();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  const navLinks = [
    { to: "/", label: "Articles" },
    { to: "/store", label: "Store" },
    { to: "/about", label: "About" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="font-serif text-2xl font-semibold tracking-tight hover:no-underline"
          >
            Editorial
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-sans text-sm tracking-wide uppercase hover:no-underline transition-opacity ${
                  location.pathname === link.to
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative text-muted-foreground hover:text-foreground"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-foreground text-background text-xs w-5 h-5 rounded-full flex items-center justify-center font-sans">
                  {totalItems}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
