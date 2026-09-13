export interface NavItem {
  label: string;
  href: string;
}

export const primaryNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Collections", href: "/collections" },
  { label: "Factory", href: "/factory" },
  { label: "Manufacturing", href: "/manufacturing" },
  { label: "Compliance", href: "/compliance" },
  { label: "Logistics", href: "/logistics" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
