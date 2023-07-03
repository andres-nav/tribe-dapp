import { useState } from "react";
import { Stack, Button } from "react-bootstrap";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.scss";

import { useAccount } from "wagmi";

import ModalCreateTribe from "../components/modals/CreateTribe";
import ModalJoinTribe from "../components/modals/JoinTribe";

const Home: NextPage = () => {
  const [modalCreateTribeShow, setModalCreateTribeShow] = useState(false);
  const [modalJoinTribeShow, setModalJoinTribeShow] = useState(false);

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
              onClick={() => setModalCreateTribeShow(true)}
            >
              Create tribe
            </Button>
            <Button
              disabled={isDisconnected}
              onClick={() => setModalJoinTribeShow(true)}
            >
              Join Tribe
            </Button>
          </Stack>
        </main>
      </div>
      <ModalCreateTribe
        show={modalCreateTribeShow}
        onHide={() => setModalCreateTribeShow(false)}
      />
      <ModalJoinTribe
        show={modalJoinTribeShow}
        onHide={() => setModalJoinTribeShow(false)}
      />
    </>
  );
};

export default Home;
