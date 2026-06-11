import { useState } from "react";
import { I18nProvider } from "./i18n/context";
import Game from "./pages/Game";
import WelcomePage from "./pages/WelcomePage";
import SettingsPage from "./pages/SettingsPage";

type Page = "welcome" | "game" | "settings";

export default function App() {
  const [page, setPage] = useState<Page>(() => {
    const saved = localStorage.getItem("qp_username");
    return saved && saved.trim().length >= 2 ? "game" : "welcome";
  });
  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem("qp_username") ?? "";
  });

  const handleEnter = (name: string) => {
    setUsername(name);
    setPage("game");
  };

  return (
    <I18nProvider>
      {page === "welcome" && (
        <WelcomePage onEnter={handleEnter} />
      )}
      {page === "settings" && (
        <SettingsPage onBack={() => setPage("game")} />
      )}
      {page === "game" && (
        <Game
          username={username}
          onOpenSettings={() => setPage("settings")}
        />
      )}
    </I18nProvider>
  );
}
