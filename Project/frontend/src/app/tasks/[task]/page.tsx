'use client';

import api from '@/app/api/api';
import { Comment } from '@/app/dto/comment';
import { Task } from '@/app/dto/task';
import { timeAgo } from '@/app/utils/time';
import { Editor } from '@monaco-editor/react';
import {
  Button,
  Divider,
  Link,
  Select,
  SelectItem,
  Spacer,
  Spinner,
  Textarea,
  Image,
  Modal,
  useDisclosure,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@nextui-org/react';
import { useTheme } from 'next-themes';
import { use, useEffect, useState } from 'react';
import Confetti from 'react-dom-confetti';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { Role } from '@/app/enum/role.enum';

enum Result {
  SUCCESS,
  FAIL,
  PENDING,
}

export default function TaskPage({ params }: { params: { task: string } }) {
  const taskId = params.task;

  const [task, setTask] = useState<Task | null>(null);
  const [language, setLanguage] = useState<string>('');
  const [userCode, setUserCode] = useState<string>('');
  const [result, setResult] = useState<Result>(Result.PENDING);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isExploding, setIsExploding] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [solved, setSolved] = useState<boolean>(false);
  const [reportText, setReportText] = useState<string>('');
  const [reportCommentId, setReportCommentId] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');

  // for admin
  const [lastCode, setLastCode] = useState<string>('');
  const [isShowUnitTests, setIsShowUnitTests] = useState<boolean>(false);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const confettiConfig = {
    angle: 90,
    spread: 360,
    startVelocity: 40,
    elementCount: 70,
    dragFriction: 0.12,
    duration: 3000,
    stagger: 3,
    width: '10px',
    height: '10px',
    perspective: '500px',
    colors: ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a'],
  };

  const { theme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState(theme);

  const submitCode = () => {
    setLoading(true);
    api
      .post(`/task/check/${taskId}`, {
        code: userCode,
        languageId: task?.languages.find((lang) => lang.name === language)?.id,
      })
      .then((res) => {
        setResult(Result.SUCCESS);
        setIsExploding(true);
        setSolved(true);
      })
      .catch((err: any) => {
        setResult(Result.FAIL);
        const cleanedErrorMessage = err.response.data.message
          .replace(/\u0000/g, '')
          .replace(/\u0002/g, '');

        setErrorMessage(cleanedErrorMessage);
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const showUnitTests = () => {
    if (isShowUnitTests) {
      setIsShowUnitTests(false);
      setUserCode(lastCode);
    } else {
      api
        .get(
          `/task/${taskId}/unit-test?languageId=${
            task?.languages.find((lang) => lang.name === language)?.id
          }`
        )
        .then((res) => {
          setLastCode(userCode);
          setUserCode(res.data.toString());
          setIsShowUnitTests(true);
        });
    }
  };

  const rejectTask = () => {
    api
      .delete(`/task/${taskId}`)
      .then((res) => {
        router.push('/tasks');
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const acceptTask = () => {
    api
      .put(`/task/accept/${taskId}`)
      .then((res) => {
        router.push('/tasks');
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const router = useRouter();

  const redirectToSolutions = () => {
    router.push(`/tasks/${taskId}/solutions/${language}`);
  };

  const submitComment = () => {
    const fetchData = async () => {
      try {
        const response = await api.post<Comment>(`/comment/${taskId}`, {
          text: commentText,
        });
        const avatarResponse = await api.get(
          `/avatar/${response.data.author.avatarId}`
        );
        response.data.author.avatar = avatarResponse.data.url;
        setComments([response.data, ...comments]);
        setCommentText('');
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  };

  const handleReportComment = () => {
    api
      .put(`/comment/${reportCommentId}/report`, {
        text: reportText,
      })
      .then((res) => {
        onOpenChange();
        toast.success('Comment reported');
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (isExploding) {
      setTimeout(() => {
        setIsExploding(false);
      }, 3000);
    }
  }, [isExploding]);

  useEffect(() => {
    setUserRole(JSON.parse(localStorage.getItem('user')!).roleId);
    api
      .get<Task>(`/task/${taskId}`)
      .then((res) => {
        setTask(res.data);
        setLanguage(res.data.languages[0].name);
        setUserCode(res.data.languages[0].codeSnippet);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const commentsResponse = await api.get<Comment[]>(`/comment/${taskId}`);
        const commentsWithAvatars = await Promise.all(
          commentsResponse.data.map(async (comment) => {
            const avatarResponse = await api.get(
              `/avatar/${comment.author.avatarId}`
            );
            comment.author.avatar = avatarResponse.data.url;
            return comment;
          })
        );
        setComments(commentsWithAvatars);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setUserCode(
      task?.languages.find((lang) => lang.name === language)?.codeSnippet || ''
    );
    setIsShowUnitTests(false);
  }, [language]);

  return (
    <>
      <div className="flex flex-col justify-center p-8 w-3/5 mx-auto space-y-4">
        {task && (
          <div className="flex flex-row space-x-4">
            <div className="flex flex-col bg-default-100 justify-between rounded-lg p-4 space-y-4 w-2/5">
              {/* info */}
              <div className="space-y-8">
                <h1 className="text-2xl font-bold">{task.title}</h1>
                <p className="text-lg">{task.description}</p>
              </div>
              <div>
                <div>
                  Author:{' '}
                  <Link
                    href={`/user/${task.authorUsername}`}
                    className="text-blue-500"
                  >
                    {task.authorUsername}
                  </Link>
                </div>
                <p className="text-gray">
                  {new Date(task.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <div className="flex flex-col space-y-4 rounded-lg w-3/5">
              {/* editor */}
              <Select
                label="language"
                defaultSelectedKeys={[language]}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {task.languages.map((lang) => (
                  <SelectItem
                    key={lang.name}
                    value={lang.name}
                    className="text-foreground"
                  >
                    {lang.name}
                  </SelectItem>
                ))}
              </Select>
              <Editor
                width="100%"
                height="45vh"
                theme={currentTheme === 'dark' ? 'vs-dark' : 'vs-light'}
                onChange={(value) => setUserCode(value || '')}
                value={userCode}
                options={{
                  readOnly: isShowUnitTests,
                }}
                language={language}
              />
              <div className="flex flex-row w-full justify-end">
                {userRole == Role.Admin ? (
                  <div className="flex flex-row space-x-2 w-full">
                    <Button
                      onClick={submitCode}
                      className="w-full bg-default-100"
                    >
                      Check
                    </Button>
                    <Button
                      onClick={showUnitTests}
                      className="w-full bg-default-100"
                    >
                      {isShowUnitTests ? 'Show code' : 'Show unit test'}
                    </Button>
                    <Button
                      onClick={rejectTask}
                      className="w-full"
                      color="danger"
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={acceptTask}
                      className="w-full"
                      color="success"
                    >
                      Accept
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={submitCode}
                    className="w-full bg-default-100"
                  >
                    Check
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        <div
          className={`rounded-2xl border ${
            result === Result.PENDING
              ? null
              : result === Result.SUCCESS
              ? 'border-success'
              : 'border-danger'
          } flex items-center p-4 ${
            result === Result.FAIL && !loading ? null : 'justify-center'
          }`}
        >
          <div className="flex items-center justify-center">
            <Confetti config={confettiConfig} active={isExploding} />
          </div>
          {loading ? (
            <Spinner />
          ) : (
            <div className="">
              {result === Result.PENDING && <>⌛ Pending for result ⌛</>}
              {result === Result.SUCCESS && (
                <div
                  className="cursor-pointer"
                  onClick={() => redirectToSolutions()}
                >
                  ✅ Success, click to check other solutions! ✅
                </div>
              )}
              {result === Result.FAIL && <>{errorMessage}</>}
            </div>
          )}
        </div>
        <Spacer y={8} />
        <div className="flex flex-col space-y-4">
          <h1 className="text-2xl font-bold">Comments</h1>
          <Divider />
          <Textarea
            placeholder="Write your comment..."
            onChange={(e) => setCommentText(e.target.value)}
            value={commentText}
          />
          <div className="flex flex-row w-full justify-end">
            <Button onClick={submitComment} className="bg-default-100 w-1/5">
              Submit
            </Button>
          </div>
          <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            className="text-foreground"
          >
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    Report comment
                  </ModalHeader>
                  <ModalBody>
                    <Textarea
                      label="Report reason"
                      placeholder="Write report reason..."
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                    />
                  </ModalBody>
                  <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                      Close
                    </Button>
                    <Button color="primary" onPress={handleReportComment}>
                      Report
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
          {comments &&
            comments.map((comment) => (
              <div key={comment.id}>
                <div className="flex flex-row space-x-4 w-full">
                  {comment.author.avatar && (
                    <div className="flex-shrink-0">
                      <Image
                        src={comment.author.avatar}
                        width={100}
                        height={100}
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <div className="flex flex-row space-x-2 items-center">
                      <div className="text-lg font-bold">
                        {comment.author.username}
                      </div>
                      <div>·</div>
                      <div className="text-sm">
                        {timeAgo(comment.createdAt)}
                      </div>
                      <div>·</div>
                      <div
                        className="text-sm text-danger cursor-pointer"
                        onClick={() => {
                          onOpen();
                          setReportCommentId(comment.id);
                        }}
                      >
                        report
                      </div>
                    </div>
                    <div className="text-md">{comment.text}</div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
