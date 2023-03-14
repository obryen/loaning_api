import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor() { }
  home() {
    return {
      message:
        'Welcome to the loaning API',
    };
  }
}
