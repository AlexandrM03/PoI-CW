'use client';

import React, { useState } from 'react';
import { Input, Button, Link } from '@nextui-org/react';
import axios, { AxiosError } from 'axios';
import api from '@/app/api/api';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();

  const handleSubmitLogin = async () => {
    try {
      const res = await api.post('/auth/login', {
        identifier,
        password,
      });

      const { access_token, user } = res.data;
      localStorage.setItem('accessToken', access_token);

      const avatar = await api.get(`/avatar/${user.avatarId}`);
      localStorage.setItem(
        'user',
        JSON.stringify({
          username: user.username,
          avatar: avatar.data.url,
          id: user.id,
          roleId: user.roleId,
        })
      );

      router.push(`/user/${user.username}`);
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
        toast.error('Failed to create task');
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 items-center">
      <Input
        type="text"
        variant="underlined"
        label="Username or Email"
        placeholder="Enter your username or email"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        isClearable
        onClear={() => setIdentifier('')}
      />
      <Input
        type="password"
        variant="underlined"
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        isClearable
        onClear={() => setPassword('')}
      />
      <Button
        color="primary"
        className="w-3/5"
        onClick={() => handleSubmitLogin()}
      >
        Login
      </Button>
      <Link
        color="primary"
        size="sm"
        underline="hover"
        href="/register"
        className="cursor-pointer"
      >
        Don't have an account?
      </Link>
    </div>
  );
}
