'use client';

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Link,
  Button,
  Image,
} from '@nextui-org/react';
import { ThemeSwitcher } from './theme-switcher';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Role } from '../enum/role.enum';

type UserInfo = {
  username: string;
  avatar: string;
  id: string;
  roleId: string;
};

export default function Navigation() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    router.push('/');
  };

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setUser(JSON.parse(user));
    }
    setIsLoading(false);
  }, []);

  return (
    <Navbar shouldHideOnScroll isBordered>
      <NavbarBrand>
        <Link href="/" className="text-foreground font-bold">
          <Image src="/logo.png" width={40} height={40}></Image>
          <p className="ml-3">CodePilot</p>
        </Link>
      </NavbarBrand>
      {user && (
        <NavbarContent>
          <Link href="/leaderboard" className="text-foreground">
            Leaderboard
          </Link>
          <Link href="/tasks" className="text-foreground">
            Tasks
          </Link>
          <Link href="/tasks/propose" className="text-foreground">
            Propose
          </Link>
          <Link href="/discussion" className="text-foreground">
            Discuss
          </Link>
          {user?.roleId == Role.Admin && (
            <Link href="/reports" className="text-foreground">
              Reports
            </Link>
          )}
        </NavbarContent>
      )}
      <NavbarContent justify="end">
        <NavbarItem>
          <ThemeSwitcher />
        </NavbarItem>
        {isLoading ? (
          <></>
        ) : user ? (
          <>
            <Image
              src={user.avatar}
              width={40}
              height={40}
              className="rounded-full cursor-pointer"
              onClick={() => {
                router.push(`/user/${user.username}`);
              }}
            />
            <Button
              className="text-foreground"
              size="md"
              color="primary"
              variant="flat"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <NavbarItem>
              <Link href="/login" className="text-foreground" size="md">
                Login
              </Link>
            </NavbarItem>
            <NavbarItem>
              <Button
                as={Link}
                className="text-foreground"
                size="md"
                color="primary"
                href="/register"
                variant="flat"
              >
                Sign Up
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>
    </Navbar>
  );
}
