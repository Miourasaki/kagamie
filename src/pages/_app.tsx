import FPSDisplay from "@/components/common/FPSDisplay";
import { BrowserProvider } from "@/store/BrowserContext";
import "../assets/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (<BrowserProvider>
    <Component {...pageProps} />

    <div className="fixed bottom-14 right-4 z-10">
      <FPSDisplay />
    </div>

  </BrowserProvider>);
}
