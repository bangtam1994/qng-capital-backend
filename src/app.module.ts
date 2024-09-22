import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './users/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '',
      database: 'qng',
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      synchronize: true, // À utiliser en développement seulement
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
