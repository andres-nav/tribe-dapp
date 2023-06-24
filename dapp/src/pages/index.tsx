import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "react-bootstrap";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.scss";

import ModalCreateTribe from "../components/modals/CreateTribe";

const Home: NextPage = () => {
  const [modalShow, setModalShow] = useState(false);

  return (
    <>
      <div className={styles.container}>
        <Head>
          <title>Tribe Dapp</title>
          <meta content="Tribe Dapp: join your tribe!" name="description" />
          <link href="/favicon.ico" rel="icon" />
        </Head>

        <div className={styles.floating}>
          <ConnectButton />
        </div>
        <main className={styles.main}>
          <h1> main</h1>
          <Button onClick={() => setModalShow(true)}>create Tribe</Button>
        </main>
      </div>
      <ModalCreateTribe show={modalShow} onHide={() => setModalShow(false)} />
    </>
  );
};

export default Home;
