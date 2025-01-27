import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import { theme } from "../../store.js";
import { useStore } from "@nanostores/react";

export default function CalEmbed() {
  const $theme = useStore(theme);
  useEffect(() => {
    (async function () {
      const Cal = await getCalApi();

      const theme =
        localStorage.getItem("theme") === "light" ? "light" : "dark";

      Cal("ui", {
        theme: theme,
        hideEventTypeDetails: false,
        cssVarsPerTheme: {
          light: {
            "cal-bg": "#F1F5F9",
            "cal-text": "black",
            "cal-text-emphasis": "black",
          },
          dark: {
            "cal-bg": "rgba(39, 39, 42, .40)",
            "cal-border-booker": "transparent",
          },
        },
      });
    })();
  }, [$theme]);
  return <Cal calLink="bostonrohan" />;
}
