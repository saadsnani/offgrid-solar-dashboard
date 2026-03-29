
import '../styles/globals.css';
import type { AppProps } from "next/app";
import { LanguageProvider } from "../lib/language-provider";
import { AlertProvider } from "../lib/alert-provider";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <AlertProvider>
        <Component {...pageProps} />
      </AlertProvider>
    </LanguageProvider>
  );
}
