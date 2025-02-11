import ReactDOM from "react-dom/client";
import App from "./App.js";
import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider } from "./components/pages/Theme-Provider.tsx";
import { store } from "./app/store.ts";
import { Provider } from "react-redux";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <Provider store={store}>
        <Router>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <App />
          </ThemeProvider>
        </Router>
    </Provider>
);
