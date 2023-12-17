'use client';

import { useEffect, useState } from 'react';
import { Report } from '../dto/report';
import api from '../api/api';
import {
  Button,
  Spacer,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    api
      .get<Report[]>('/comment/reports')
      .then((res) => {
        setReports(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleDeleteReport = (id: string) => {
    api
      .delete(`/comment/${id}/report`)
      .then((res) => {
        setReports(reports.filter((report) => report.id !== id));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleDeleteComment = (id: string) => {
    api
      .delete(`/comment/${id}`)
      .then((res) => {
        setReports(reports.filter((report) => report.id !== id));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="w-3/5 mx-auto flex flex-col space-y-4 p-8">
      <div className="flex flex-row space-x-4 w-full">
        {reports && (
          <Table isStriped>
            <TableHeader>
              <TableColumn>Reason</TableColumn>
              <TableColumn>Reported by</TableColumn>
              <TableColumn>Comment</TableColumn>
              <TableColumn>Author</TableColumn>
              <TableColumn>Actions</TableColumn>
            </TableHeader>
            <TableBody items={reports}>
              {(item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.text}</TableCell>
                  <TableCell>{item.author.username}</TableCell>
                  <TableCell>{item.comment.text}</TableCell>
                  <TableCell>{item.comment.author.username}</TableCell>
                  <TableCell>
                    <div className="flex flex-row justify-center">
                      <Button
                        onClick={() => {
                          handleDeleteReport(item.id);
                        }}
                        size="sm"
                      >
                        Delete report
                      </Button>
                      <Spacer x={0.5} />
                      <Button
                        onClick={() => {
                          handleDeleteComment(item.id);
                        }}
                        size="sm"
                        color="danger"
                      >
                        Delete comment
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
