import { createRoot } from "react-dom/client";
import "antd-mobile/es/global";
import "./index.css";
import App from "./App.tsx";
import { setupAntdMobileRender } from "./utils/setupAntdMobileRender";

setupAntdMobileRender();

createRoot(document.getElementById("root")!).render(<App />);
