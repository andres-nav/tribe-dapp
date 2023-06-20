import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "react-bootstrap";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.scss";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Tribe dApp</title>
        <meta content="Tribe dApp: join your tribe!" name="description" />
        <link href="/favicon.ico" rel="icon" />
      </Head>

      <div className={styles.floating}>
        <ConnectButton />
      </div>
      <main className={styles.main}></main>
    </div>
  );
};

export default Home;
