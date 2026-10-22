import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type ThemeType = "light" | "dark" | "system";
type ResolvedThemeType = "light" | "dark";

type ThemeStateType = {
  theme: ThemeType;
  resolvedTheme: ResolvedThemeType;
  setTheme: (theme: ThemeType) => void;
};

const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

function resolveTheme(theme: ThemeType): ResolvedThemeType {
  if (theme !== "system") return theme;
  return window.matchMedia(DARK_MEDIA_QUERY).matches ? "dark" : "light";
}

function applyTheme(resolvedTheme: ResolvedThemeType): void {
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
}

/**
 * Theme preference is persisted (it is not sensitive), and "system" follows the OS setting.
 * A Zustand store replaces the Context provider used in the previous project.
 */
export const useThemeStore = create<ThemeStateType>()(
  persist(
    (set) => ({
      theme: "system",
      resolvedTheme: resolveTheme("system"),
      setTheme: (theme) => {
        const resolvedTheme = resolveTheme(theme);
        applyTheme(resolvedTheme);
        set({ theme, resolvedTheme });
      },
    }),
    {
      name: "theme",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        if (state) state.setTheme(state.theme);
      },
    },
  ),
);

// Keep "system" in sync when the OS theme changes while the app is open.
window.matchMedia(DARK_MEDIA_QUERY).addEventListener("change", () => {
  const { theme, setTheme } = useThemeStore.getState();
  if (theme === "system") setTheme("system");
});
