import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>My Next.js App</title>
        <meta name="description" content="A simple page for CodeQL testing" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Welcome to My Next.js App</h1>
        <p>This is a simple index page for CodeQL testing purposes.</p>
      </main>
    </div>
  );
};

export default Home;
