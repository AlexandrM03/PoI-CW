'use client';

import api from '@/app/api/api';
import SolutionsList from '@/app/components/solution-card';
import { Solution } from '@/app/dto/solution';
import { User } from '@/app/dto/user';
import { Editor } from '@monaco-editor/react';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CircularProgress,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Switch,
  Textarea,
  useDisclosure,
} from '@nextui-org/react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

interface UserEditFormData {
  name: string;
  surname: string;
  company: string;
  isReadyToWork: boolean;
  about: string;
}

export default function UserPage({ params }: { params: { username: string } }) {
  const { username } = params;
  const [user, setUser] = useState<User | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [solutions, setSolutions] = useState<Solution[] | null>(null);
  const [solutionsLength, setSolutionsLength] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [userEditFormData, setUserEditFormData] = useState<UserEditFormData>({
    name: '',
    surname: '',
    company: '',
    about: '',
    isReadyToWork: false,
  });
  const inputRef = useRef(null);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { theme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState(theme);

  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  const solutionsRef = useRef(solutions);
  const solutionsLengthRef = useRef(solutionsLength);

  useEffect(() => {
    solutionsRef.current = solutions;
  }, [solutions]);

  useEffect(() => {
    solutionsLengthRef.current = solutionsLength;
  }, [solutionsLength]);

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop !==
        document.documentElement.offsetHeight ||
      loading
    ) {
      return;
    }

    loadMoreSolutions();
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading]);

  const loadMoreSolutions = () => {
    if (
      !loading &&
      solutionsRef.current &&
      solutionsRef.current.length < solutionsLengthRef.current
    ) {
      setLoading(true);

      api
        .get(
          `/user/${username}/solutions?page=${Math.floor(
            solutionsRef.current.length / 3 + 1
          )}`
        )
        .then((response) => {
          setSolutions((prevSolutions) => [
            ...(prevSolutions as Solution[]),
            ...response.data.solutions,
          ]);
        })
        .catch((error) => {
          console.error(error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  const handleSubmitEditUser = () => {
    api
      .put<User>(`/user`, userEditFormData)
      .then((response) => {
        setUser(response.data);
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
          toast.error('Failed to update user info');
        }
      });
  };

  const handleChangeAvatar = async (event: any) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      await api.put(`/user/avatar`, {
        avatarId: response.data.id,
      });

      const avatarUrl = await api.get(`/avatar/${response.data.id}`);
      const user = JSON.parse(localStorage.getItem('user')!);
      user.avatar = avatarUrl.data.url;
      localStorage.setItem('user', JSON.stringify(user));
      window.location.reload();
    } catch (err: any) {
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
        toast.error('Failed to upload avatar');
      }
    }
  };

  const evaluateRank = (score: number) => {
    if (score < 50) {
      return 'Code Cadet';
    } else if (score < 150) {
      return 'Script Kiddie';
    } else if (score < 500) {
      return 'Debugging Maestro';
    } else if (score < 2000) {
      return 'Byte Boffin';
    } else {
      return 'Turing Titan';
    }
  };

  const evaluateNextRank = (score: number) => {
    if (score < 50) {
      return 'To: Script Kiddie (50 points)';
    } else if (score < 150) {
      return 'To: Debugging Maestro (150 points)';
    } else if (score < 500) {
      return 'To: Byte Boffin (500 points)';
    } else if (score < 2000) {
      return 'To: Turing Titan (2000 points)';
    } else {
      return 'Max rank reached';
    }
  };

  const evaluatePercentage = (score: number) => {
    if (score < 50) {
      return (score / 50) * 100;
    } else if (score < 150) {
      return ((score - 50) / 100) * 100;
    } else if (score < 500) {
      return ((score - 150) / 350) * 100;
    } else if (score < 2000) {
      return ((score - 500) / 1500) * 100;
    } else {
      return 100;
    }
  };

  useEffect(() => {
    api
      .get<User>(`/user/${username}`)
      .then((response) => {
        setUser(response.data);
        userEditFormData.name = response.data.name;
        userEditFormData.surname = response.data.surname;
        userEditFormData.company = response.data.company || '';
        userEditFormData.about = response.data.about || '';
        userEditFormData.isReadyToWork = response.data.isReadyToWork;
        const avatarId = response.data.avatarId;
        return api.get(`/avatar/${avatarId}`);
      })
      .then((avatarResponse) => {
        setAvatar(avatarResponse.data.url);
      })
      .then(() => {
        return api.get(`/user/${username}/solutions?page=1`);
      })
      .then((response) => {
        setSolutionsLength(response.data.length);
        setSolutions(response.data.solutions);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [username]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    fieldName: keyof UserEditFormData
  ) => {
    const value = e.target.value;
    setUserEditFormData((prevData) => ({ ...prevData, [fieldName]: value }));
  };

  const handleSwitchChange = (value: boolean) => {
    setUserEditFormData((prevData) => ({ ...prevData, isReadyToWork: value }));
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className="text-foreground"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit user info
              </ModalHeader>
              <ModalBody>
                <Input
                  label="Name"
                  placeholder="Enter your name"
                  value={userEditFormData.name}
                  onChange={(e) => handleInputChange(e, 'name')}
                />
                <Input
                  label="Surname"
                  placeholder="Enter your surname"
                  value={userEditFormData.surname}
                  onChange={(e) => handleInputChange(e, 'surname')}
                />
                <Input
                  label="Company"
                  placeholder="Enter your company"
                  value={userEditFormData.company}
                  onChange={(e) => handleInputChange(e, 'company')}
                />
                <Textarea
                  label="About"
                  placeholder="Tell us about yourself"
                  value={userEditFormData.about}
                  onChange={(e) => handleInputChange(e, 'about')}
                />
                <div className="flex items-center gap-2">
                  <span>Ready to work:</span>
                  <Switch
                    onValueChange={handleSwitchChange}
                    isSelected={userEditFormData.isReadyToWork}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={handleSubmitEditUser}>
                  Edit
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="flex flex-col justify-center p-8 w-3/5 mx-auto space-y-4">
        <div className="flex flex-row justify-center space-x-4">
          {user && (
            <>
              <div className="flex bg-default-100 rounded-2xl p-4 flex-col space-x-4 space-y-4 w-3/5">
                <div className="flex flex-row space-x-4 w-full">
                  {avatar ? (
                    <Image
                      src={avatar}
                      width={120}
                      height={120}
                      alt={`${user.username}'s avatar`}
                      className="rounded cursor-pointer hover:opacity-70 transition-opacity duration-300"
                      onClick={() => {
                        if (inputRef.current) {
                          (inputRef.current as HTMLInputElement).click();
                        }
                      }}
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-300 animate-pulse rounded-full"></div>
                  )}
                  <input
                    type="file"
                    ref={inputRef}
                    style={{ display: 'none' }}
                    onChange={handleChangeAvatar}
                  />
                  <div className="flex flex-col justify-between w-full">
                    <div className="flex flex-row justify-between w-full">
                      <div>
                        <p className="text-2xl">{user.username}</p>
                        <p>{user.email}</p>
                      </div>
                      <div>
                        {JSON.parse(localStorage.getItem('user')!).username ===
                          username && (
                          <Button variant="ghost" onPress={onOpen}>
                            <div>Edit</div>
                          </Button>
                        )}
                      </div>
                    </div>
                    <p>Rank: {evaluateRank(user.score)}</p>
                  </div>
                </div>
                <hr />
                <div className="flex flex-col space-y-1">
                  <p>Name: {user.name || '-'}</p>
                  <p>Surname: {user.surname || '-'}</p>
                  <p>Company: {user.company || '-'}</p>
                  <p>Ready to work: {user.isReadyToWork ? 'Yes' : 'No'}</p>
                  <p>About: {user.about || '-'}</p>
                  <p>
                    Member since:{' '}
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex bg-default-100 rounded-2xl flex-row justify-center items-center p-4 w-2/5">
                <div className="flex flex-col items-center">
                  <p className="text-xl">User score: {user.score} points</p>
                  <CircularProgress
                    showValueLabel={true}
                    classNames={{
                      svg: 'w-36 h-36 drop-shadow-md',
                      value: 'text-3xl font-semibold ',
                    }}
                    className="text-foreground"
                    value={evaluatePercentage(user.score)}
                  />
                  <p>{evaluateNextRank(user.score)}</p>
                  <p className="mt-10">Solved tasks: {user.solvedTaskCount}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {solutions && (
          <div className="space-y-4">
            <SolutionsList solutions={solutions} currentTheme={currentTheme!} />
            <div
              className="flex justify-center items-center"
              style={{ minHeight: '50px' }}
            >
              {loading && <CircularProgress color="primary" />}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
