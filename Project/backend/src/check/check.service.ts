import { Injectable } from '@nestjs/common';
import Docker from 'dockerode';
import * as fs from 'fs/promises';
import { S3Service } from 'src/s3/s3.service';
import { v4 as uuid } from 'uuid';

@Injectable()
export class CheckService {
    constructor(
        private s3: S3Service
    ) { }

    private readonly tempPath = './public/temp/';
    private readonly volumePath = 'D:\\7 semester\\CW\\Project\\code-pilot\\public\\temp\\'
    // private readonly volumePath = 'D:\\7 semester\\CW\\Project\\code-pilot\\codepilot-temp\\'

    async checkPythonTask(unitTestPath: string, code: string) {
        const fullFilePath = await this.createTestFile(unitTestPath, code, 'py', true)

        return await this.executePythonCode(fullFilePath);
    }

    async checkGoTask(unitTestPath: string, code: string) {
        const fullFilePath = await this.createTestFile(unitTestPath, code, 'go', true)

        return await this.executeGoCode(fullFilePath);
    }

    async checkRustTask(unitTestPath: string, code: string) {
        const fullFilePath = await this.createTestFile(unitTestPath, code, 'rs', false)

        return await this.executeRustCode(fullFilePath);
    }

    async checkCppTask(unitTestPath: string, code: string) {
        const fullFilePath = await this.createTestFile(unitTestPath, code, 'cpp', true)

        return await this.executeCppCode(fullFilePath);
    }

    private async createTestFile(unitTestPath: string, code: string, ext: string, codeFirst: boolean) {
        // const unitTest = await fs.readFile(unitTestPath, 'utf-8');
        const unitTestFile = await this.s3.getUnitTest(unitTestPath);
        const unitTest = await unitTestFile.transformToString();
        let codeWithTests: string;
        if (codeFirst) {
            codeWithTests = code + '\n' + unitTest;
        } else {
            codeWithTests = unitTest + '\n' + code;
        }
        const fileName = uuid() + '.' + ext;
        const filePath = this.tempPath + fileName;
        await fs.writeFile(filePath, codeWithTests, 'utf-8');
        return fileName;
    }

    private async cleanup(container: Docker.Container, filePath: string) {
        container.stop(() => {
            container.remove()
        });
        await fs.unlink(filePath);
    }

    private async executePythonCode(fileName: string) {
        const docker = new Docker();
        const container = await docker.createContainer({
            Image: 'python:3-alpine',
            Tty: true,
            AttachStdout: true,
            AttachStderr: true,
            HostConfig: {
                Binds: [
                    // `${this.tempPath + fileName}:/usr/src/app/code_with_tests.py`,
                    `${this.volumePath + fileName}:/usr/src/app/code_with_tests.py`,
                ],
            },
        });

        await container.start();
        const exec = await container.exec({
            Cmd: ['python', '/usr/src/app/code_with_tests.py'],
            AttachStdout: true,
            AttachStderr: true,
        });

        const stream = await exec.start({
            hijack: true
        });
        const result = await this.getStreamData(stream);

        await this.cleanup(container, this.tempPath + fileName);

        return result;
    }

    private async executeGoCode(fileName: string) {
        const docker = new Docker();
        const container = await docker.createContainer({
            Image: 'golang:1.21.4-alpine3.17',
            Tty: true,
            AttachStdout: true,
            AttachStderr: true,
            HostConfig: {
                Binds: [
                    // `${this.tempPath + fileName}:/usr/src/app/code_with_tests.go`,
                    `${this.volumePath + fileName}:/usr/src/app/code_with_tests.go`,
                ],
            },
        });

        await container.start();
        const exec = await container.exec({
            Cmd: ['go', 'run', '/usr/src/app/code_with_tests.go'],
            AttachStdout: true,
            AttachStderr: true,
        });

        const stream = await exec.start({
            hijack: true
        });
        const result = await this.getStreamData(stream);

        await this.cleanup(container, this.tempPath + fileName);

        return result;
    }

    private async executeRustCode(fileName: string) {
        const docker = new Docker();
        const container = await docker.createContainer({
            Image: 'rust:alpine3.17',
            Tty: true,
            AttachStdout: true,
            AttachStderr: true,
            HostConfig: {
                Binds: [
                    // `${this.tempPath + fileName}:/usr/src/app/code_with_tests.rs`,
                    `${this.volumePath + fileName}:/usr/src/app/code_with_tests.rs`,
                ],
            },
        });

        await container.start();
        const execCompile = await container.exec({
            Cmd: ['rustc', '/usr/src/app/code_with_tests.rs', '-o', '/usr/src/app/main'],
            AttachStdout: true,
            AttachStderr: true,
        });

        const streamCompile = await execCompile.start({
            hijack: true
        });
        const resultCompile = await this.getStreamData(streamCompile);
        if (resultCompile !== '') {
            await this.cleanup(container, this.tempPath + fileName);
            return resultCompile;
        }

        const exec = await container.exec({
            Cmd: ['/usr/src/app/main'],
            AttachStdout: true,
            AttachStderr: true,
        });

        const stream = await exec.start({
            hijack: true
        });
        const result = await this.getStreamData(stream);

        await this.cleanup(container, this.tempPath + fileName);

        return result;
    }

    private async executeCppCode(fileName: string) {
        const docker = new Docker();
        const container = await docker.createContainer({
            Image: 'gcc:bookworm',
            Tty: true,
            AttachStdout: true,
            AttachStderr: true,
            HostConfig: {
                Binds: [
                    // `${this.tempPath + fileName}:/usr/src/app/code_with_tests.cpp`,
                    `${this.volumePath + fileName}:/usr/src/app/code_with_tests.cpp`,
                ],
            },
        });

        await container.start();
        const execCompile = await container.exec({
            Cmd: ['g++', '/usr/src/app/code_with_tests.cpp', '-o', '/usr/src/app/main', '-std=c++20'],
            AttachStdout: true,
            AttachStderr: true,
        });

        const streamCompile = await execCompile.start({
            hijack: true
        });
        const resultCompile = await this.getStreamData(streamCompile);
        if (resultCompile !== '') {
            await this.cleanup(container, this.tempPath + fileName);
            return resultCompile;
        }

        const exec = await container.exec({
            Cmd: ['/usr/src/app/main'],
            AttachStdout: true,
            AttachStderr: true,
        });

        const stream = await exec.start({
            hijack: true
        });
        const result = await this.getStreamData(stream);

        await this.cleanup(container, this.tempPath + fileName);

        return result;
    }

    private async getStreamData(stream: NodeJS.ReadableStream) {
        let result = '';
        await new Promise((resolve, reject) => {
            stream.on('data', (chunk) => {
                result += chunk.toString('utf-8');
            });
            stream.on('end', () => {
                resolve(null);
            });
            stream.on('error', (err) => {
                reject(err);
            });
        });
        return result;
    }
}
