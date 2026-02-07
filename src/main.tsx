import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("Starting app mount...");
const root = document.getElementById("root");
console.log("Root element:", root);

if (!root) {
    console.error("FATAL: Root element not found!");
} else {
    try {
        createRoot(root).render(<App />);
        console.log("App mounted successfully");
    } catch (error) {
        console.error("Error mounting app:", error);
    }
}
