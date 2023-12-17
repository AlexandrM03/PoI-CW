'use client';

import { useEffect, useState } from 'react';
import api from '@/app/api/api';
import { Leaders } from '@/app/dto/leaders';
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Image,
  Input,
  Button,
  Spinner,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { User } from '../dto/user';
import { useAsyncList } from '@react-stately/data';
import { useInfiniteScroll } from '@nextui-org/use-infinite-scroll';

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<Leaders[] | null>(null);
  const [isShowLeaderboard, setIsShowLeaderboard] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [buttonPressed, setButtonPressed] = useState<boolean>(false);

  const [hasMore, setHasMore] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const leadersResponse = await api.get<Leaders[]>('/user/leaderboard');
        const leadersWithAvatars = await Promise.all(
          leadersResponse.data.map(async (leader) => {
            const avatarResponse = await api.get(`/avatar/${leader.avatarId}`);
            leader.avatar = avatarResponse.data.url;
            return leader;
          })
        );
        setLeaders(leadersWithAvatars);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const handleSearchClick = async () => {
    try {
      const usersResponse = await api.get(
        `/user/search?username=${username}&page=1`
      );
      const usersWithAvatars = await Promise.all(
        usersResponse.data.usersWithRank.map(async (user: User) => {
          const avatarResponse = await api.get(`/avatar/${user.avatarId}`);
          user.avatar = avatarResponse.data.url;
          return user;
        })
      );
      setUsers(usersWithAvatars);
      setHasMore(usersWithAvatars.length < usersResponse.data.length);
      setIsShowLeaderboard(false);
    } catch (error) {
      console.error(error);
    }
  };

  const loadMore = async () => {
    try {
      const usersResponse = await api.get(
        `/user/search?username=${username}&page=${
          Math.floor(users.length / 10) + 1
        }`
      );
      const usersWithAvatars = await Promise.all(
        usersResponse.data.usersWithRank.map(async (user: User) => {
          const avatarResponse = await api.get(`/avatar/${user.avatarId}`);
          user.avatar = avatarResponse.data.url;
          return user;
        })
      );
      setUsers((prevUsers) => [...prevUsers, ...usersWithAvatars]);
      setHasMore(
        users.length + usersWithAvatars.length < usersResponse.data.length
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const handle = async () => {
      if (buttonPressed) {
        if (username.length === 0) {
          setIsShowLeaderboard(true);
        }

        setHasMore(false);

        if (username.length > 0) {
          await handleSearchClick();
        }

        setButtonPressed(false);
      }
    };

    handle();
  }, [buttonPressed]);

  const [loaderRef, scrollRef] = useInfiniteScroll({
    hasMore,
    onLoadMore: loadMore,
  });

  const handleRowClick = (username: string) => {
    router.push(`/user/${username}`);
  };

  return (
    <div className="w-3/5 mx-auto flex flex-col space-y-4 p-8">
      <div className="flex flex-row space-x-4 w-full">
        <Input
          placeholder="Enter username"
          onChange={(e) => setUsername(e.target.value)}
        />
        <Button
          onClick={() => {
            setButtonPressed(true);
          }}
        >
          Search
        </Button>
      </div>
      {isShowLeaderboard ? (
        <>
          <div>
            <h1 className="text-2xl">Leaderboard</h1>
          </div>
          {leaders && (
            <Table isStriped>
              <TableHeader>
                <TableColumn>Avatar</TableColumn>
                <TableColumn>Username</TableColumn>
                <TableColumn>Name</TableColumn>
                <TableColumn>Surname</TableColumn>
                <TableColumn>Ready to work?</TableColumn>
                <TableColumn>Score</TableColumn>
                <TableColumn>Solved tasks</TableColumn>
              </TableHeader>
              <TableBody>
                {leaders.map((leader, index) => (
                  <TableRow
                    key={index}
                    onClick={() => handleRowClick(leader.username)}
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <Image
                        width={50}
                        height={50}
                        radius="full"
                        src={leader.avatar!}
                      ></Image>
                    </TableCell>
                    <TableCell>{leader.username}</TableCell>
                    <TableCell>{leader.name || '-'}</TableCell>
                    <TableCell>{leader.surname || '-'}</TableCell>
                    <TableCell>{leader.isReadyToWork ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{leader.score}</TableCell>
                    <TableCell>{leader.solvedTaskCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      ) : (
        <>
          <div>
            <h1 className="text-2xl">Users</h1>
          </div>
          {users && (
            <Table
              baseRef={scrollRef}
              bottomContent={
                hasMore ? (
                  <div className="flex w-full justify-center">
                    <Spinner ref={loaderRef} color="white" />
                  </div>
                ) : null
              }
              classNames={{
                base: 'overflow-y-scroll',
              }}
            >
              <TableHeader>
                <TableColumn>Rank</TableColumn>
                <TableColumn>Avatar</TableColumn>
                <TableColumn>Username</TableColumn>
                <TableColumn>Name</TableColumn>
                <TableColumn>Surname</TableColumn>
                <TableColumn>Ready to work?</TableColumn>
                <TableColumn>Score</TableColumn>
                <TableColumn>Solved tasks</TableColumn>
              </TableHeader>
              <TableBody items={users}>
                {(item) => (
                  <TableRow
                    key={item.username}
                    onClick={() => handleRowClick(item.username)}
                    className="cursor-pointer"
                  >
                    <TableCell>{item.rank}</TableCell>
                    <TableCell>
                      <Image
                        width={50}
                        height={50}
                        radius="full"
                        src={item.avatar!}
                      ></Image>
                    </TableCell>
                    <TableCell>{item.username}</TableCell>
                    <TableCell>{item.name || '-'}</TableCell>
                    <TableCell>{item.surname || '-'}</TableCell>
                    <TableCell>{item.isReadyToWork ? 'Yes' : 'No'}</TableCell>
                    <TableCell>{item.score}</TableCell>
                    <TableCell>{item.solvedTaskCount}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </>
      )}
    </div>
  );
}
