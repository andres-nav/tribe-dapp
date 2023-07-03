import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import { getTribeInfo } from "../../scripts/nft-storage";

import { useContractRead, useContractWrite } from "wagmi";
import { abiTribeDapp } from "../../scripts/abi-tribe-dapp";
import { utils } from "ethers";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export default function ModalJoinTribe(props) {
  const {
    data: maxId,
    isError: isErrorMaxId,
    isLoading: isLoadingMaxId,
  } = useContractRead({
    address: contractAddress,
    abi: abiTribeDapp,
    functionName: "getMaxId",
  });

  function getAllTribes() {
    let tribes = [];

    for (let i = 1; i <= maxId; i++) {
      const {
        data: tribe,
        isError: isErrorTribe,
        isLoading: isLoadingTribe,
      } = useContractRead({
        address: contractAddress,
        abi: abiTribeDapp,
        functionName: "getTribe",
        args: [i],
      });

      tribe.info = getTribeInfo(tribe.at(4));

      tribes.push(tribe);
    }
    console.log(tribes);
    return tribes;
  }

  const tribes = getAllTribes();

  return (
    <Modal {...props} centered style="">
      <Modal.Header closeButton>
        <Modal.Title>Join new tribe</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Container>
          <Row>
            {tribes.map((tribe) => {
              return (
                <Col sm={6} md={4} className="mt-3" key={tribe.at(4)}>
                  <Card style={{ width: "18rem" }}>
                    {/* <Card.Img variant="top" src="holder.js/100px180" /> */}
                    <Card.Body>
                      <Card.Title>{tribe.at(4)}</Card.Title>
                      <Card.Text>{tribe.at(0)}</Card.Text>
                      Price to join: {utils.formatEther(tribe.at(1))} ETH
                    </Card.Body>

                    <Card.Footer>
                      <Button variant="primary" type="submit">
                        Join
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Container>
      </Modal.Body>

      <Modal.Footer className="justify-content-between"></Modal.Footer>
    </Modal>
  );
}
