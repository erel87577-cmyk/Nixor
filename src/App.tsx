import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";
import "./styles/tokens.css";
import "./styles/globals.css";

export function App() {
  return <RouterProvider router={router} />;
}
