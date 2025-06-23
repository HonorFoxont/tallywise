import { RouterProvider } from "react-router-dom";
import appRouter from '@/router/appRouter'
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={appRouter}/> 
   </AuthProvider>
  )
}

export default App
