'use client';

import {
  Button,
  Input,
  Select,
  SelectItem,
  Tab,
  Tabs,
  Textarea,
} from '@nextui-org/react';
import { Editor } from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { ChangeEvent, useEffect, useState } from 'react';
import api from '@/app/api/api';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

interface CreateTaskFormData {
  title: string;
  description: string;
  taskComplexityId: string;
  languages: string[];
  unitTestCode: Record<string, string>;
  codeSnippet: Record<string, string>;
}

export default function ProposePage() {
  const [createTaskFormData, setCreateTaskFormData] =
    useState<CreateTaskFormData>({
      title: '',
      description: '',
      taskComplexityId: '',
      languages: [],
      unitTestCode: {},
      codeSnippet: {},
    });
  const [complexities, setComplexities] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);
  const [languages, setLanguages] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);

  useEffect(() => {
    api.get('/complexity').then((res) => {
      setComplexities(res.data);
    });

    api.get('/languages').then((res) => {
      setLanguages(res.data);
    });
  }, []);

  const { theme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState(theme);

  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    fieldName: keyof CreateTaskFormData
  ) => {
    const value = e.target.value;
    setCreateTaskFormData((prevData) => ({ ...prevData, [fieldName]: value }));
  };

  const handleSelectChange = (
    e: ChangeEvent<HTMLSelectElement>,
    fieldName: keyof CreateTaskFormData
  ) => {
    const value = e.target.value;
    setCreateTaskFormData((prevData) => ({ ...prevData, [fieldName]: value }));
  };

  const handleEditorChange = (
    value: string,
    languageId: string,
    field: 'unitTestCode' | 'codeSnippet'
  ) => {
    setCreateTaskFormData((prevData) => ({
      ...prevData,
      [field]: {
        ...prevData[field],
        [languageId]: value,
      },
    }));
  };

  const handleSubmit = () => {
    createTaskFormData.languages = [];
    for (const language of languages) {
      if (
        !createTaskFormData.unitTestCode[language.id] ||
        !createTaskFormData.codeSnippet[language.id]
      ) {
        delete createTaskFormData.unitTestCode[language.id];
        delete createTaskFormData.codeSnippet[language.id];
      }

      if (
        createTaskFormData.unitTestCode[language.id] &&
        createTaskFormData.codeSnippet[language.id]
      ) {
        createTaskFormData.languages.push(language.id);
      }
    }

    api
      .post('/task', createTaskFormData)
      .then((res) => {
        toast.success('Task created successfully');
        setCreateTaskFormData({
          title: '',
          description: '',
          taskComplexityId: '',
          languages: [],
          unitTestCode: {},
          codeSnippet: {},
        });
      })
      .catch((err: AxiosError<any>) => {
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
      })
      .catch((err) => {
        toast.error('Failed to create task');
        console.error(err);
      });
  };

  return (
    <div className="flex flex-col justify-center p-8 w-3/5 mx-auto space-y-4">
      <Input
        label="Title"
        placeholder="Task title"
        onChange={(e) => handleInputChange(e, 'title')}
      />
      <Textarea
        label="Description"
        placeholder="Task description"
        onChange={(e) => handleInputChange(e, 'description')}
      />
      <Select
        placeholder="Select complexity"
        onChange={(e) => handleSelectChange(e, 'taskComplexityId')}
        label="Complexity"
      >
        {complexities.map((complexity) => (
          <SelectItem
            key={complexity.id}
            value={complexity.id}
            className="text-foreground"
          >
            {complexity.name}
          </SelectItem>
        ))}
      </Select>
      {languages && (
        <Tabs>
          {languages.map((language) => (
            <Tab key={language.id} title={language.name}>
              <div className="flex flex-col space-y-4 w-full">
                <div>
                  <h1 className="text-2xl font-bold">Unit tests</h1>
                  <Editor
                    height="25vh"
                    defaultLanguage={language.name}
                    theme={currentTheme === 'dark' ? 'vs-dark' : 'vs-light'}
                    value={createTaskFormData.unitTestCode[language.id]}
                    onChange={(value) =>
                      handleEditorChange(
                        value || '',
                        language.id,
                        'unitTestCode'
                      )
                    }
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Code snippet</h1>
                  <Editor
                    height="15vh"
                    defaultLanguage={language.name}
                    theme={currentTheme === 'dark' ? 'vs-dark' : 'vs-light'}
                    value={createTaskFormData.codeSnippet[language.id]}
                    onChange={(value) =>
                      handleEditorChange(
                        value || '',
                        language.id,
                        'codeSnippet'
                      )
                    }
                  />
                </div>
              </div>
            </Tab>
          ))}
        </Tabs>
      )}
      <Button color="primary" onClick={() => handleSubmit()}>
        Submit
      </Button>
    </div>
  );
}
