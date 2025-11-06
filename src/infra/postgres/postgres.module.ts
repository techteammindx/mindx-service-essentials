import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('POSTGRES_HOST') || '',
        port: config.get<number>('POSTGRES_PORT') || 0,
        username: config.get<string>('POSTGRES_USERNAME') || '',
        password: config.get<string>('POSTGRES_PASSWORD') || '',
        entities: [__dirname + '/entities/**/*.entity{.ts,.js}']
      })
    })
  ]
})
export class PostgresModule {}

