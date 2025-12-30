import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/design-system/molecules/Toast";
import { UploadProvider } from "@/components/providers/UploadContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <UploadProvider>
        <ToastProvider>{children}</ToastProvider>
      </UploadProvider>
    </ThemeProvider>
  );
}
