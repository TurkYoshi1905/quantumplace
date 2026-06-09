import { useState } from "react";
import { I18nProvider } from "./i18n/context";
import Game from "./pages/Game";
import SettingsPage from "./pages/SettingsPage";

type Page = "game" | "settings";

export default function App() {
  const [page, setPage] = useState<Page>("game");

  return (
    <I18nProvider>
      {page === "settings" ? (
        <SettingsPage onBack={() => setPage("game")} />
      ) : (
        <Game onOpenSettings={() => setPage("settings")} />
      )}
    </I18nProvider>
  );
}
