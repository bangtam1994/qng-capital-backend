import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './user.entity';
import path from 'path';
import nodemailer from 'nodemailer';
import { CreateUserDto, CreateUserSchema } from './user.dto';
import { Order } from '../order/order.entity';
// import fs from 'fs';

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

      await this.usersRepository.save(user);

      return user;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.driverError.code === '23505') {
          throw new HttpException('Email already exists', HttpStatus.CONFLICT);
        }
      }

      throw new HttpException(
        'Internal Server Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addOrderToUser(userId: number, order: Order): Promise<User> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    console.log('User orders before saving:', user.orders);

    if (user.orders) {
      user.orders.push(order);
      console.log('Pushed order to user  ! ');
    } else {
      user.orders = [order];
    }
    await this.usersRepository.save(user);
    console.log('User orders after saving:', user.orders);

    return user;
  }

  async suscribe(body: { email: string; from: string }) {
    const { email, from } = body;

    try {
      const user = await this.findByEmail(email);
      if (user) {
        console.log('User already exist, skipping creation', email);
        return user;
      } else {
        const newUser = await this.create({ email });
        console.log('New user created in db,', email);
        const transporter = nodemailer.createTransport({
          host: 'ssl0.ovh.net',
          port: 465,
          secure: true,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER,
          subject: 'New suscriber to QNG Capital !',
          text: `New suscriber informations : ${newUser.email}, Suscribed from : ${from}`,
        };
        const info = await transporter.sendMail(mailOptions);
        console.log(
          `New suscriber email ${email}, notification sent to ${process.env.EMAIL_USER}: ` +
            info.response,
        );
        return newUser;
      }
    } catch (error) {
      return error;
    }
  }
  async sendEbook(body: CreateUserDto): Promise<string> {
    const { email } = body;

    const user = await this.findByEmail(email);
    if (user) {
      if (user.ebookSent) {
        await this.sendEbookEmail(user);
        return 'Ebook has already been sent to this user, a new copie has been sent';
      } else {
        console.log('user already created, skipping creationg');

        await this.sendEbookEmail(user);
        await this.markEbookAsSent(user);

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

  async findUserById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async markEbookAsSent(user: User): Promise<User> {
    user.ebookSent = true;
    return this.usersRepository.save(user);
  }

  private async sendEbookEmail(user: User) {
    const transporter = nodemailer.createTransport({
      host: 'ssl0.ovh.net',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      bcc: process.env.EMAIL_USER,
    });

    const pdfPath = path.join(process.cwd(), 'src/ebook_supply_and_demand.pdf');
    // const htmlContent = fs.readFileSync(
    //   path.join(process.cwd(), 'src/mail_ebook.html'),
    //   'utf-8',
    // );
    const mailOptions = {
      from: `QNG Capital <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Ton E-book SUPPLY AND DEMAND QngCapital est disponible ! ',
      html: `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ton eBook de Trading GRATUIT</title>
    <style>
        body {
            font-family: Inter, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: auto;
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      background-color: #ffffff
        }
        .header {
            background: linear-gradient(135deg, #007f6f, #a103fc);
            color: white;
            padding: 10px 0;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 14px;
            color: #777;
        }
        .footer_2 {
            margin-top: 20px;
            text-align: center;
            font-size: 16px;

        }
        .cta-button {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #007f6f;
            color: white;
            text-decoration: none;
            border-radius: 5px;
      		margin: 20px auto;
      	cursor: pointer
        }
        ul {
            list-style-type: none;
            padding: 0;
        }
        li {
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Ton e-book de Trading Gratuit Supply And Demand !</h1>
        </div>
        <p>Salut ${user.firstName},</p>
         <p>Tu as rejoins la communauté des Smart Traders, félicitations ! </p>
       <p>Je t'enseigne dans le e-book les bases complètes du trading ainsi que des éléments nécessaire pour faire de toi un trader armé sur les marchés !</p>
        <ul>
            <li>📈 Stratégies de trading éprouvées</li>
            <li>📊 Analyse technique simplifiée</li>
            <li>💡 Conseils pour éviter les erreurs courantes</li>
            <li>🛠️ Outils indispensables pour trader efficacement</li>
            <li>📅 Plan d'action pour ton année de trading</li>
                      <li>... Et encore pleins d'autres choses 😉</li>

        </ul>
      
      En outre, j'y ai aussi mis des éléments intéressants, appris de mes expériences en tant que trader. Tu verras, il est ludique et bien complet ! 
        <p>N'hésite pas à me faire un retour d'expérience, et me rejoindre sur Telegram : </p>
       <p style="text-align: center;">
         
       <a href="https://telegram.me/+tMYzFAAxJyc5YzJk" class="cta-button">QNG CAPITAL</a></p>
        <p>Si tu as la moindre questions, n'hésite pas à me contacter à <a href="mailto:contact@qngcapital.com">contact@qngcapital.com</a>.</p>
              <p style="text-align: center;">Merci pour ta confiance et ton soutien ! </p>

        <div class="footer">
          <p>Alexandre P., fondateur de <strong>QNG Capital</strong></br></p>
          <p>www.qngcapital.com</p>
        </div>
      
    </div>
</body></html>`,
      attachments: [
        {
          filename: 'ebook.pdf',
          path: path.join(pdfPath),
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`Ebook sent to ${user.email}: ` + info.response);

    const mailToNotifyMeOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Someone requested an ebook',
      text: `User ${user.email} has requested an ebook.`,
    };
    const infoNotify = await transporter.sendMail(mailToNotifyMeOptions);
    console.log(
      `User ${user.email} has requested an ebook ` + infoNotify.response,
    );
  }
}
