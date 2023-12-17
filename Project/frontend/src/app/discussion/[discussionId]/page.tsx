'use client';

import api from '@/app/api/api';
import { Message } from '@/app/dto/message';
import { useEffect, useRef, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { Button, Image, Input } from '@nextui-org/react';
import { timeAgo } from '@/app/utils/time';
import { useRouter } from 'next/navigation';
import { useKeyboardShortcut } from '@/app/hooks/keyboard';

export default function ChatPage({
  params,
}: {
  params: { discussionId: string };
}) {
  const { discussionId } = params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [userId, setUserId] = useState();
  const [username, setUsername] = useState<string | null>('');
  const [socket, setSocket] = useState<Socket | null>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const handleUserClick = (username: string) => {
    router.push(`/user/${username}`);
  };

  useEffect(() => {
    setUserId(JSON.parse(localStorage.getItem('user')!).id);
    setUsername(JSON.parse(localStorage.getItem('user')!).username);

    const socketInstance = io(
      `http://localhost:3000?discussionId=${discussionId}`,
      {
        transports: ['websocket'],
        withCredentials: true,
        extraHeaders: {
          'Access-Control-Allow-Origin': 'http://localhost:5000',
        },
      }
    );

    setSocket(socketInstance);

    socketInstance.on('loadMessages', (messages: Message[]) => {
      const promises = messages.map((message) => {
        return api
          .get(`/avatar/${message.author.avatarId}`)
          .then((response) => {
            message.author.avatar = response.data.url;
          });
      });

      Promise.all(promises).then(() => {
        setMessages(messages);
      });
    });

    socketInstance.on('newMessage', async (message: Message) => {
      try {
        const response = await api.get(`/avatar/${message.author.avatarId}`);
        message.author.avatar = response.data.url;

        setMessages((prevMessages) => [...prevMessages, message]);
      } catch (error) {
        console.error('Error fetching avatar:', error);
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [discussionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    const message = {
      text,
      userId,
      discussionId,
    };
    setText('');
    socket?.emit('writeMessage', message);
  };

  useKeyboardShortcut(['enter'], sendMessage);

  return (
    <div
      className="flex flex-col justify-end p-8 w-3/5 mx-auto h-full space-y-4"
      style={{ maxHeight: '90vh' }}
    >
      <div className="flex flex-col flex-grow overflow-y-auto p-4 space-y-2 h-[80vh]">
        {messages.map((message, index) => (
          <div
            className={`flex flex-row space-x-4 ${
              message.author.username === username
                ? 'justify-end'
                : 'justify-start'
            }`}
            key={index}
          >
            {message.author.username !== username && message.author.avatar ? (
              <Image
                src={message.author.avatar}
                width={50}
                height={50}
                radius="full"
                onClick={() => handleUserClick(message.author.username)}
                className="cursor-pointer"
              />
            ) : null}
            <div
              className={`bg-default-100 p-4 rounded-2xl min-w-[20%] max-w-[70%] break-words ${
                message.author.username === username ? 'self-end' : 'self-start'
              }`}
            >
              <div className="flex flex-row">
                <span className="font-bold">{message.author.username}</span>
              </div>
              <span>{message.text}</span>
              <div className="flex justify-end">
                <span className="text-xs ml-2 text-gray-400">
                  {timeAgo(message.createdAt.toString())}
                </span>
              </div>
            </div>
            {message.author.username === username && message.author.avatar ? (
              <Image
                src={message.author.avatar}
                width={50}
                height={50}
                radius="full"
                onClick={() => handleUserClick(message.author.username)}
                className="cursor-pointer"
              />
            ) : null}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex flex-row space-x-4">
        <Input
          className="flex-grow"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
}
