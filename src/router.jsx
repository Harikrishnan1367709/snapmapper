
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import UpdatedCode from "./components/UpdatedCode";
import Documentation from "./components/Documentation";

const router = createBrowserRouter([
  {
    path: "/",
    element: <UpdatedCode />,
  },
  {
    path: "/docs",
    element: <Documentation />
  }
]);

export function Router() {
  return <RouterProvider router={router} />;
}
