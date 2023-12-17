'use client';

import { Button, Input, Link } from '@nextui-org/react';
import api from '@/app/api/api';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showVerificationForm, setShowVerificationForm] = useState(true);

  const [verificationCode, setVerificationCode] = useState('');
  const [retryDisabled, setRetryDisabled] = useState(true);
  const [remainingTime, setRemainingTime] = useState(30);

  const router = useRouter();

  const handleSubmitRegistration = async () => {
    try {
      const res = await api.post('/auth/register', {
        email,
        username,
        password,
      });
      setShowVerificationForm(false);
      const interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev === 0) {
            setRetryDisabled(false);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
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

  const handleSubmitCode = async () => {
    try {
      const res = await api.put(`/auth/activate/${verificationCode}`);
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
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      } else {
        console.error('Error registering:', error);
      }
    }
  };

  const handleResendCode = async () => {
    try {
      const res = await api.get(`/auth/resend/${email}`);
      setRetryDisabled(true);
      setRemainingTime(30);
      const interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev === 0) {
            setRetryDisabled(false);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      } else {
        console.error('Error registering:', error);
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 items-center">
      {showVerificationForm ? (
        <>
          <Input
            type="email"
            variant="underlined"
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isClearable
            onClear={() => setEmail('')}
          />
          <Input
            type="text"
            variant="underlined"
            label="Username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            isClearable
            onClear={() => setUsername('')}
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
            onClick={() => handleSubmitRegistration()}
          >
            Register
          </Button>
          <Link
            color="primary"
            size="sm"
            underline="hover"
            href="/login"
            className="cursor-pointer"
          >
            Already have an account?
          </Link>
        </>
      ) : (
        <>
          <Input
            type="text"
            variant="underlined"
            label="Verification Code"
            placeholder="Enter your verification code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            isClearable
            onClear={() => setVerificationCode('')}
          />
          <Button color="primary" onClick={() => handleSubmitCode()}>
            Verify
          </Button>
          {retryDisabled ? (
            <p className="text-sm">Retry in {remainingTime}s</p>
          ) : (
            <Link
              color="primary"
              size="sm"
              underline="hover"
              onClick={() => handleResendCode()}
              className="cursor-pointer"
            >
              Resend Code
            </Link>
          )}
        </>
      )}
    </div>
  );
}
