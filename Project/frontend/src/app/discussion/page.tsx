'use client';

import { useEffect, useState } from 'react';
import { Discussion } from '../dto/discussion';
import api from '../api/api';
import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spacer,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { Role } from '../enum/role.enum';
import { toast } from 'react-toastify';

export default function DiscussionPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [topic, setTopic] = useState<string>('');

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const router = useRouter();

  useEffect(() => {
    setUserRole(JSON.parse(localStorage.getItem('user')!).roleId);

    api
      .get<Discussion[]>('/discussions')
      .then((response) => setDiscussions(response.data))
      .catch((error) => console.error(error));
  }, []);

  const joinDiscussion = (id: string) => {
    router.push(`/discussion/${id}`);
  };

  const deleteDiscussion = (id: string) => {
    api
      .delete(`/discussions/${id}`)
      .then(() => {
        setDiscussions((prevDiscussions) =>
          prevDiscussions.filter((discussion) => discussion.id !== id)
        );
      })
      .catch((error) => console.error(error));
  };

  const handleCreateDiscussion = () => {
    api
      .post('/discussions', { topic })
      .then((response) => {
        setDiscussions((prevDiscussions) => [
          ...prevDiscussions,
          response.data,
        ]);
        onOpenChange();
      })
      .catch((err: any) => {
        if (err.response?.data && err.response.data.message) {
          const errorMessages = err.response.data.message;

          if (Array.isArray(errorMessages)) {
            for (const error of errorMessages) {
              toast.error(error);
            }
          } else {
            toast.error(errorMessages);
          }
        } else {
          toast.error('Failed to create task');
        }
      });
  };

  return (
    <div className="flex flex-col justify-center p-8 w-3/5 mx-auto space-y-4">
      <div className="flex flex-col justify-center space-y-4">
        <Modal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          className="text-foreground"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  Create topic
                </ModalHeader>
                <ModalBody>
                  <Input
                    label="Topic"
                    placeholder="Write a topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Close
                  </Button>
                  <Button color="primary" onPress={handleCreateDiscussion}>
                    Create
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
        <Button color="primary" onClick={onOpenChange}>
          Create topic
        </Button>
        {discussions && (
          <Table>
            <TableHeader>
              <TableColumn>Name</TableColumn>
              <TableColumn width={'25%'}>Actions</TableColumn>
            </TableHeader>
            <TableBody>
              {discussions.map((discussion) => (
                <TableRow key={discussion.id}>
                  <TableCell>{discussion.topic}</TableCell>
                  <TableCell className="flex flex-row">
                    {userRole == Role.Admin && (
                      <>
                        <Button
                          size="sm"
                          color="danger"
                          onClick={() => deleteDiscussion(discussion.id)}
                        >
                          Delete
                        </Button>
                        <Spacer x={0.5} />
                      </>
                    )}
                    <Button
                      size="sm"
                      onClick={() => joinDiscussion(discussion.id)}
                    >
                      Join
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
