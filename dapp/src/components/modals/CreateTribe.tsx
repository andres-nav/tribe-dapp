import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

import mime from "mime/lite";
import { storeTribeInfo } from "../../scripts/nft-storage";

import { useContractRead, useContractWrite } from "wagmi";
import { abiTribeDapp } from "../../scripts/abi-tribe-dapp";
import { utils } from "ethers";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export default function ModalCreateTribe(props) {
  const {
    data: priceNewTribe,
    isError: isErrorPriceNewTribe,
    isLoading: isLoadingPriceNewTribe,
  } = useContractRead({
    address: contractAddress,
    abi: abiTribeDapp,
    functionName: "getPriceNewTribe",
  });

  const {
    data: dataCreateTribe,
    isLoading: isLoadingCreateTribe,
    isSuccess: isSuccessCreateTribe,
    write: writeCreateTribe,
  } = useContractWrite({
    address: contractAddress,
    abi: abiTribeDapp,
    functionName: "createTribe",
  });

  const createTribe = (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    const name = form.name.value;
    const description = form.description.value;
    const priceToJoin = utils.parseEther(form.priceToJoin.value);
    const maxCapacity = ~~form.maxCapacity.value;
    const link = form.link.value;
    const image = form.image.files[0];

    if (priceToJoin < 0 || maxCapacity < 0 || !image.type.includes("image/")) {
      return;
    }

    writeCreateTribe({
      args: [priceToJoin, maxCapacity, link],
      value: priceNewTribe,
    });
    /* const metadata = storeTribeInfo(image, name, description, link); */

    /* props.onHide(); */
  };

  return (
    <Modal {...props} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create new tribe</Modal.Title>
      </Modal.Header>

      <Form onSubmit={createTribe}>
        <Modal.Body>
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1">Name</InputGroup.Text>
            <Form.Control
              name="name"
              required
              type="text"
              aria-describedby="basic-addon1"
            />
          </InputGroup>

          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1">Description</InputGroup.Text>
            <Form.Control
              name="description"
              required
              as="textarea"
              rows={2}
              aria-describedby="basic-addon1"
            />
          </InputGroup>
          <InputGroup className="mb-3">
            {}{" "}
            <InputGroup.Text id="basic-addon1">Price to join</InputGroup.Text>
            <Form.Control
              name="priceToJoin"
              required
              type="number"
              min="0"
              step="0.00000000001"
              aria-describedby="basic-addon1"
            />
            <InputGroup.Text id="basic-addon1">ETH</InputGroup.Text>
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1">Max capacity</InputGroup.Text>
            <Form.Control
              name="maxCapacity"
              required
              type="number"
              min="0"
              aria-describedby="basic-addon1"
            />
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1">Link</InputGroup.Text>
            <Form.Control
              name="link"
              required
              type="text"
              aria-describedby="basic-addon1"
            />
          </InputGroup>

          <InputGroup className="mb-3">
            <Form.Control
              name="image"
              required
              type="file"
              accept="image/*"
              aria-describedby="basic-addon1"
            />
          </InputGroup>
        </Modal.Body>

        <Modal.Footer className="justify-content-between">
          <strong>PRICE: {utils.formatEther(priceNewTribe)} ETH</strong>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
