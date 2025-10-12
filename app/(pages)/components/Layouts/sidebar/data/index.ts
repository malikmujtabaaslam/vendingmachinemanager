// src/components/Layouts/sidebar/data/index.ts
import * as Icons from "../icons";

export const getNavData = (role: string | null) => {
  if (role === "admin") {
    return [
      {
        label: "ADMIN MENU",
        items: [
          {
            title: "Dashboard",
            url: "/admin/dashboard",
            icon: Icons.HomeIcon,
            items: [],
          },
          {
            title: "Users",
            url: "/admin/users",
            icon: Icons.User,
            items: [],
          },
          {
            title: "Documentation",
            url: "/admin/documentation",
            icon: Icons.BookOpen,
            items: [],
          },
        ],
      },
    ];
  }

  // Default: user role
  return [
    {
      label: "USER MENU",
      items: [
        {
          title: "Dashboard",
          url: "/user/dashboard",
          icon: Icons.HomeIcon,
          items: [],
        },
        {
          title: "Vending Machines",
          url: "/user/scripts",
          icon: Icons.Cpu,
          items: [],
        },
      ],
    },
  ];
};
