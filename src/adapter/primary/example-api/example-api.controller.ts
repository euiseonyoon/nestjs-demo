import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
} from '@nestjs/common';
import { ExampleApiService } from '../../../application/example-api/example-api.service';

@Controller('example-api')
export class ExampleApiController {
    constructor(private readonly exampleApiService: ExampleApiService) {}

    @Get('users')
    async getUsers() {
        return this.exampleApiService.getUsers();
    }

    @Get('users/:id')
    async getUserById(@Param('id') id: string) {
        return this.exampleApiService.getUserById(Number(id));
    }

    @Post('posts')
    async createPost(
        @Body() body: { title: string; body: string; userId: number },
    ) {
        return this.exampleApiService.createPost(
            body.title,
            body.body,
            body.userId,
        );
    }

    @Get('posts/user/:userId')
    async getPostsByUserId(@Param('userId') userId: string) {
        return this.exampleApiService.getPostsWithParams(Number(userId));
    }

    @Put('posts/:id')
    async updatePost(
        @Param('id') id: string,
        @Body() body: { title: string; body: string },
    ) {
        return this.exampleApiService.updatePost(
            Number(id),
            body.title,
            body.body,
        );
    }

    @Delete('posts/:id')
    async deletePost(@Param('id') id: string) {
        return this.exampleApiService.deletePost(Number(id));
    }

    @Get('custom-request')
    async customRequest() {
        return this.exampleApiService.customRequest();
    }
}
