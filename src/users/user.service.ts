import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import path from 'path';
import nodemailer from 'nodemailer';
import { CreateUserDto, CreateUserSchema } from './user.dto';
import fs from 'fs';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userBody: CreateUserDto): Promise<User> {
    try {
      const parsedData = CreateUserSchema.parse(userBody);
      const user = this.usersRepository.create(parsedData);
      this.usersRepository.save(user);
      return user;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async sendEbook(body: CreateUserDto): Promise<string> {
    const { email } = body;

    const user = await this.findByEmail(email);
    if (user) {
      if (user.ebookSent) {
        return 'Ebook has already been sent to this user.';
      } else {
        console.log('user already created, skipping creationg');

        await this.sendEbookEmail(user);
        return 'Ebook has been sent to this user.';
      }
    } else {
      const newUser = await this.create(body);
      console.log('user has been created!', newUser);
      // await this.ordersService.create(user, productType);

      await this.sendEbookEmail(newUser);

      await this.markEbookAsSent(newUser);

      return `Ebook sent successfully to the user : ${newUser.email}!`;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async markEbookAsSent(user: User): Promise<User> {
    user.ebookSent = true;
    return this.usersRepository.save(user);
  }

  private async sendEbookEmail(user: User) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const pdfPath = path.join(process.cwd(), 'src/test_ebook.pdf');
    const htmlContent = fs.readFileSync(
      path.join(process.cwd(), 'src/mail_ebook.html'),
      'utf-8',
    );
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Ton E-book QNG CAPITAL est disponible ! ',
      html: htmlContent,
      attachments: [
        {
          filename: 'ebook.pdf',
          path: path.join(pdfPath),
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  }
}
