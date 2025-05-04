import { Html, Head, Main, NextScript } from "next/document";


export default function Document() {
  return (
    <Html lang="ja">
      <Head>
        <title>Kagami è for EveryOne</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
