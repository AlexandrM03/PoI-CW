'use client';

import api from '@/app/api/api';
import SolutionsList from '@/app/components/solution-card';
import { Solution } from '@/app/dto/solution';
import { CircularProgress } from '@nextui-org/react';
import { useTheme } from 'next-themes';
import { useEffect, useRef, useState } from 'react';

export default function TaskSolutionsPage({
  params,
}: {
  params: { task: string; language: string };
}) {
  const taskId = params.task;
  const language = params.language;

  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [solutionsLength, setSolutionsLength] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const solutionsRef = useRef(solutions);
  const solutionsLengthRef = useRef(solutionsLength);

  const { theme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState(theme);

  useEffect(() => {
    solutionsRef.current = solutions;
  }, [solutions]);

  useEffect(() => {
    solutionsLengthRef.current = solutionsLength;
  }, [solutionsLength]);

  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

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
      solutionsLengthRef.current &&
      solutionsRef.current.length < solutionsLengthRef.current
    ) {
      setLoading(true);

      api
        .get(
          `/task/${taskId}/solutions?page=${Math.floor(
            solutionsRef.current.length / 3 + 1
          )}&language=${language}`
        )
        .then((res) => {
          setSolutions((prevSolution) => [
            ...(prevSolution as Solution[]),
            ...res.data.solutions,
          ]);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    api
      .get(`/task/${taskId}/solutions?page=1&language=${language}`)
      .then((res) => {
        setSolutions(res.data.solutions);
        setSolutionsLength(res.data.length);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div className="flex flex-col justify-center p-8 w-3/5 mx-auto space-y-4">
      {solutions && (
        <div>
          <SolutionsList solutions={solutions} currentTheme={currentTheme!} />
          <div
            className="flex justify-center items-center"
            style={{ minHeight: '50px', marginTop: '20px' }}
          >
            {loading && <CircularProgress color="primary" />}
          </div>
        </div>
      )}
    </div>
  );
}
