import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  PhoneIcon,
  CircleStackIcon,
  ServerStackIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Tables, Notifications,Search,GMail,CompanyTrace} from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <PhoneIcon {...icon} />,
        name: "Phonora",
        path: "/search",
        element: <Search />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Ghost Mail Hunter",
        path: "/GMail",
        element: <GMail />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Company Trace",
        path: "/CompanyTrace",
        element: <CompanyTrace />,
      },
      /*{
        icon: <HomeIcon {...icon} />,
        name: "Search",
        path: "/search",
        element: <Search />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "profile",
        path: "/profile",
        element: <Profile />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "tables",
        path: "/tables",
        element: <Tables />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "notifications",
        path: "/notifications",
        element: <Notifications />,
      },*/
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
];

export default routes;
