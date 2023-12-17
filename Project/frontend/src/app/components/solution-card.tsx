import { Editor } from '@monaco-editor/react';
import {
  Card,
  CardHeader,
  Divider,
  CardBody,
  CardFooter,
  Button,
  Link,
  Pagination,
} from '@nextui-org/react';
import { useState } from 'react';
import { Solution } from '../dto/solution';
import { HeartIcon } from './icons';

interface SolutionCardProps {
  solution: Solution;
  currentTheme: string;
}

const SolutionCard: React.FC<SolutionCardProps> = ({
  solution,
  currentTheme,
}) => {
  const [editorHeight, setEditorHeight] = useState('15vh');

  const updateEditorHeight = () => {
    const lineCount = solution.code.split('\n').length;
    const newHeight = `${lineCount * 19}px`;
    setEditorHeight(newHeight);
  };

  const handleExpand = () => {
    updateEditorHeight();
  };

  const handleCollapse = () => {
    setEditorHeight('15vh');
  };

  return (
    <Card className="bg-default-100 w-full">
      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <p className="text-md">{solution.taskTitle}</p>
          <p className="text-small text-default-500">
            {new Date(solution.createdAt).toLocaleTimeString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              second: 'numeric',
            })}
          </p>
          {/* {solution.authorUsername && (
            <p className="text-sm mt-3">
              Created by:{' '}
              <Link
                href={`/user/${solution.authorUsername}`}
                size="sm"
                underline="hover"
              >
                {solution.authorUsername}
              </Link>
            </p>
          )} */}
        </div>
      </CardHeader>
      <Divider />
      <CardBody>
        <Editor
          width="100%"
          height={editorHeight}
          defaultLanguage={solution.language}
          value={solution.code}
          theme={currentTheme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            readOnly: true,
            minimap: {
              enabled: false,
            },
            lineNumbers: 'off',
          }}
        />
      </CardBody>
      <Divider />
      <CardFooter className="flex justify-between">
        <div className="flex flex-row space-x-4 items-center">
          {/* <p>Likes count: {solution.likeCount}</p>
          {solution.authorUsername && (
            <Button isIconOnly color="danger" aria-label="Like" size="sm">
              <HeartIcon />
            </Button>
          )} */}
          <p>Language: {solution.language}</p>
        </div>
        {editorHeight === '15vh' ? (
          <Button size="sm" onClick={handleExpand}>
            Fit
          </Button>
        ) : (
          <Button size="sm" onClick={handleCollapse}>
            Back
          </Button>
        )}
      </CardFooter>
      <Divider />
    </Card>
  );
};

const SolutionsList: React.FC<{
  solutions: Solution[];
  currentTheme: string;
}> = ({ solutions, currentTheme }) => {
  return (
    <div className="flex flex-col space-y-4 justify-center items-center">
      {solutions.map((solution) => (
        <SolutionCard
          key={solution.id}
          solution={solution}
          currentTheme={currentTheme}
        />
      ))}
    </div>
  );
};

export default SolutionsList;
