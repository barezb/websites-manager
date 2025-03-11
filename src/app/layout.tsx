"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ServerIcon,
  UserIcon,
  FolderIcon,
  LogoutIcon,
} from "@heroicons/react/outline";
import "@/app/globals.css"
const MENU_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
  },
  {
    name: "Websites",
    href: "/dashboard/websites",
    icon: ServerIcon,
  },
  {
    name: "Clients",
    href: "/dashboard/clients",
    icon: UserIcon,
  },
  {
    name: "Categories",
    href: "/dashboard/categories",
    icon: FolderIcon,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    const res = await fetch("/api/logout", {
      method: "POST",
    });

    if (res.ok) {
      router.push("/login");
    } else {
      console.error("Logout failed");
    }
  };

  return (
    <html>
      <body>
      <div className="flex">
        <nav className="w-64 bg-gray-800 text-white">
          <ul>
            {MENU_ITEMS.map((item) => (
              <li
                key={item.name}
                className={pathname === item.href ? "bg-gray-900" : ""}
              >
                <a href={item.href} className="flex items-center p-4">
                  <item.icon className="w-6 h-6 mr-2" />
                  {item.name}
                </a>
              </li>
            ))}
            <li>
              <button
                onClick={handleLogout}
                className="flex items-center p-4 w-full text-left"
              >
                <LogoutIcon className="w-6 h-6 mr-2" />
                Logout
              </button>
            </li>
          </ul>
        </nav>
        <main className="flex-1 p-8">{children}</main>
      </div>
      </body>
    </html>
  );
}
