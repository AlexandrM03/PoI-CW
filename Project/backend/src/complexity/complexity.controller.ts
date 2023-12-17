import { Controller, Get } from '@nestjs/common';
import { ComplexityService } from './complexity.service';

@Controller('complexity')
export class ComplexityController {
    constructor(private readonly complexityService: ComplexityService) { }

    @Get()
    async getComplexities() {
        return await this.complexityService.getComplexities();
    }
}
