import type { FullChat } from "../graphql/fragments";
import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  ModalFooter
} from "@chakra-ui/react";

type ChatInfoProps = {
  chat: FullChat;
  isOpen: boolean;
  onClose: () => void;
};

function ChatInfo(props: ChatInfoProps): JSX.Element {
  return (
    <Modal isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader color="teal">Group Info</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Role</Th>
                <Th>Username</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>Admin</Td>
                <Td>{props.chat.admin.username}</Td>
              </Tr>
            </Tbody>
            <Tbody>
              {props.chat.users.map(u => (
                <Tr key={u.id}>
                  <Td>User</Td>
                  <Td>{u.username}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
}

export default ChatInfo;
