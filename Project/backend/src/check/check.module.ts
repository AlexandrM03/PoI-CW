import { Module } from '@nestjs/common';
import { CheckService } from './check.service';
import { S3Module } from 'src/s3/s3.module';

@Module({
    providers: [CheckService],
    imports: [S3Module]
})
export class CheckModule { }
