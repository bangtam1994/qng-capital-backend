<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Description

QNG Capital backend in nest, using typeorm and postgres db.

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn dev

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Stripe payment

If you want to test the payment process locally, you need to run ngrok to forward the requests to your local server as stripe needs to call the server to handle the payment (webhook endpoint).

```bash
$ ngrok http 3100
```

In the frontend, you need to edit the `VITE_BACKEND_URL` in the .env file to match the ngrok url.

Then in Stripe dashboard, you need to add the webhook endpoint with the ngrok url.
At : https://dashboard.stripe.com/test/workbench/webhooks
Dont forget to add at the end of the url `/payment/webhook`

## EMAIl

Email is using nodemailer.
To send email, please check the .env file for the email credentials.

```bash
EMAIL_USER=
EMAIL_PASS=
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```
