import { useState } from "react";
import { Stack, Button } from "react-bootstrap";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.scss";

import { useAccount } from "wagmi";

import ModalCreateTribe from "../components/modals/CreateTribe";

const Home: NextPage = () => {
  const [modalShow, setModalShow] = useState(false);
  const { address, isConnecting, isDisconnected } = useAccount();

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
          <Stack direction="horizontal" gap={3} className="mx-auto">
            <Button
              disabled={isDisconnected}
              onClick={() => setModalShow(true)}
            >
              Create tribe
            </Button>
            <Button disabled={isDisconnected}>Join Tribe</Button>
          </Stack>
        </main>
      </div>
      <ModalCreateTribe show={modalShow} onHide={() => setModalShow(false)} />
    </>
  );
};

export default Home;
