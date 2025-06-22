import { createBrowserRouter } from "react-router-dom";

import Index from "@/views/Index";
import Dashboard from "@/views/Dashboard";
import Transactions from "@/views/Transactions";
import NotFound from "@/views/NotFound";

const router = createBrowserRouter([
  {path: "/", element:<Index />},
  {path: "/dashboard", element:<Dashboard />},
  {path: "/transactions", element:<Transactions />},
  {path: "*", element:<NotFound />}
]);

export default router;