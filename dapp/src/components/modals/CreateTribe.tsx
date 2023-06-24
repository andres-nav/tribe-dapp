import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";

import { storeTribeInfo } from "../../scripts/nft-storage";

export default function ModalCreateTribe(props) {
  const createTribe = (e) => {
    e.preventDefault();
    const metadata = storeTribeInfo("test", "description", 1, 10, "google.com");
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
              required
              type="text"
              placeholder="My awesome tribe!"
              aria-label="My awesome tribe!"
              aria-describedby="basic-addon1"
            />
          </InputGroup>
          <InputGroup className="mb-3">
            {}{" "}
            <InputGroup.Text id="basic-addon1">Price to join</InputGroup.Text>
            <Form.Control
              required
              type="number"
              min="0"
              step="0.00000000001"
              placeholder="0.01"
              aria-label="0.01"
              aria-describedby="basic-addon1"
            />
            <InputGroup.Text id="basic-addon1">ETH</InputGroup.Text>
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1">Max capacity</InputGroup.Text>
            <Form.Control
              required
              type="number"
              min="0"
              placeholder="100"
              aria-label="100"
              aria-describedby="basic-addon1"
            />
          </InputGroup>
          <InputGroup className="mb-3">
            <InputGroup.Text id="basic-addon1">Link</InputGroup.Text>
            <Form.Control
              required
              type="text"
              placeholder="www.myawesometribe.com"
              aria-label="www.myawesometribe.com"
              aria-describedby="basic-addon1"
            />
          </InputGroup>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
