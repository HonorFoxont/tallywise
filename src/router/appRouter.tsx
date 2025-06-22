import { createBrowserRouter } from "react-router-dom";

import Index from "@/views/Index";
import Dashboard from "@/views/Dashboard";
import Transactions from "@/views/Transactions";
import NotFound from "@/views/NotFound";
import Login from "@/views/Login";

const router = createBrowserRouter([
  {path: "/", element:<Index />},
  {path: "/dashboard", element:<Dashboard />},
  {path: "/transactions", element:<Transactions />},
  {path: "*", element:<NotFound />},
  {path: "/login", element:<Login />}
]);

export default router;