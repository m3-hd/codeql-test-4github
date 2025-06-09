import { Html, Head, Main, NextScript } from "next/document";

export default function Document(): React.ReactElement {
  return (
    <Html lang="en">
      <Head />
      <link rel="icon" href="/favicon.ico" />
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
