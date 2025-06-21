import { createBrowserRouter } from "react-router-dom";

import Index from "@/views/index";
import Dashboard from "@/views/dashboard";
import Transactions from "@/views/Transactions";
import NotFound from "@/views/NotFound";

const router = createBrowserRouter([
  {path: "/", element:<Index />},
  {path: "/dashboard", element:<Dashboard />},
  {path: "/transactions", element:<Transactions />},
  {path: "*", element:<NotFound />}
]);

export default router;