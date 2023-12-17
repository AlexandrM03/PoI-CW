'use client';

import { useEffect, useState } from 'react';
import { TaskCard } from '../dto/task-card';
import { useKeyboardShortcut } from '../hooks/keyboard';
import {
  Input,
  Pagination,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import api from '../api/api';
import {
  CppIcon,
  GoIcon,
  PythonIcon,
  RustIcon,
  SearchIcon,
} from '../components/icons';
import { useRouter } from 'next/navigation';
import { Role } from '../enum/role.enum';

const Complexities = [
  'Code Cadet',
  'Script Kiddie',
  'Debugging Maestro',
  'Byte Boffin',
  'Turing Titan',
  'All',
];

const Languages = ['python', 'go', 'rust', 'cpp', 'All'];

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskCard[] | null>(null);
  const [pages, setPages] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [complexity, setComplexity] = useState<string>('All');
  const [language, setLanguage] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('most-solved');
  const [search, setSearch] = useState<string>('');
  const [htmlChange, setHtmlChange] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>('');

  const router = useRouter();

  const handleRedirectToTask = (id: string) => {
    router.push(`/tasks/${id}`);
  };

  const fetchData = (firstPage: boolean) => {
    if (firstPage) {
      setPage(1);
    }
    setHtmlChange(false);
    api
      .get(
        `/task/${
          userRole == Role.Admin ? 'not-accepted' : 'accepted'
        }?sort=${sortBy}&complexity=${complexity}&language=${language}&searchTerm=${search}&page=${
          firstPage ? 1 : page
        }`
      )
      .then((res) => {
        setTasks(res.data.tasks);
        setPages(Math.ceil(res.data.length / 10));
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setUserRole(JSON.parse(localStorage.getItem('user')!).roleId);
        const url =
          '/task/' +
          (JSON.parse(localStorage.getItem('user')!).roleId == Role.Admin
            ? 'not-accepted'
            : 'accepted?sort=most-solved');
        const res = await api.get(url);
        setTasks(res.data.tasks);
        setPages(Math.ceil(res.data.length / 10));
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (htmlChange) {
      fetchData(true);
    }
  }, [complexity, language, sortBy, search]);

  useEffect(() => {
    if (htmlChange) {
      fetchData(false);
    }
  }, [page]);

  let iconsKey = 0;
  const languageToSvg = (language: string) => {
    iconsKey++;
    if (language === 'python') {
      return <PythonIcon key={iconsKey} />;
    } else if (language === 'go') {
      return <GoIcon key={iconsKey} />;
    } else if (language === 'rust') {
      return <RustIcon key={iconsKey} />;
    } else if (language === 'cpp') {
      return <CppIcon key={iconsKey} />;
    }
  };

  return (
    <div className="flex flex-col justify-center p-8 w-3/5 mx-auto space-y-4">
      <div className="flex flex-row justify-center space-x-4">
        {tasks && (
          <div className="flex rounded p-4 flex-col space-y-4 w-full">
            <div className="flex rounded p-4 flex-col space-y-6 w-full items-center justify-center">
              <Input
                labelPlacement="outside"
                className="w-3/5"
                label="Search"
                placeholder="Type to search..."
                startContent={
                  <SearchIcon className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
                }
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setHtmlChange(true);
                }}
              />
              <div className="flex flex-row w-full space-x-4 items-center">
                <RadioGroup
                  label="Sort by"
                  orientation="vertical"
                  className="w-1/3"
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setHtmlChange(true);
                  }}
                >
                  <div className="space-x-4">
                    <Radio value="most-solved">Most solved</Radio>
                    <Radio value="least-solved">Least solved</Radio>
                  </div>
                  <div className="space-x-4">
                    <Radio value="newest">Newest</Radio>
                    <Radio value="oldest">Oldest</Radio>
                  </div>
                  <div className="space-x-4">
                    <Radio value="most-popular">Most popular</Radio>
                    <Radio value="least-popular">Least popular</Radio>
                  </div>
                </RadioGroup>
                <Select
                  labelPlacement="outside"
                  label="Complexity"
                  defaultSelectedKeys={['All']}
                  className="w-1/3"
                  value={complexity}
                  onChange={(e) => {
                    setComplexity(e.target.value);
                    setHtmlChange(true);
                  }}
                >
                  {Complexities.map((complexity) => (
                    <SelectItem
                      key={complexity}
                      value={complexity}
                      className="text-foreground"
                    >
                      {complexity}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  labelPlacement="outside"
                  label="Languages"
                  defaultSelectedKeys={['All']}
                  className="w-1/3"
                  value={complexity}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    setHtmlChange(true);
                  }}
                >
                  {Languages.map((language) => (
                    <SelectItem
                      key={language}
                      value={language}
                      className="text-foreground"
                    >
                      {language}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
            <Table aria-label="Tasks collection" isStriped={true}>
              <TableHeader>
                <TableColumn>Title</TableColumn>
                <TableColumn>Complexity</TableColumn>
                <TableColumn>Languages</TableColumn>
                <TableColumn>Solved times</TableColumn>
                <TableColumn>Created at</TableColumn>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow
                    key={task.id}
                    onClick={() => handleRedirectToTask(task.id)}
                    className="cursor-pointer"
                  >
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.taskComplexity}</TableCell>
                    <TableCell>
                      <div className="flex flex-row space-x-1">
                        {task.languages.map((task) => {
                          return languageToSvg(task);
                        })}
                      </div>
                    </TableCell>
                    <TableCell>{task.solvedTimes}</TableCell>
                    <TableCell>
                      {new Date(task.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination
              showControls
              total={pages}
              initialPage={page}
              onChange={(e) => {
                setPage(e);
                setHtmlChange(true);
              }}
              page={page}
            />
          </div>
        )}
      </div>
    </div>
  );
}
