import Document, { Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
          <link
            rel="shortcut icon"
            href="https://tailwindui.com/img/logos/workflow-mark-blue-600.svg"
            type="image/x-icon"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
