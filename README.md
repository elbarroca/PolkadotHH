To-do:

- Correct implementation for folders, i would store also the folders created by users on the db, make sure developer console use same folder structure
- Create file + add uri to db
- Share files with other wallets + make sure the tokens can de/serialize correctly (I would use encryption, the user who received the shared files should sign a message and be able to access the file by deserializing it). So step 1, is the owner sharing the file, the other user got an access token which is needed from cere network sdk. How to make the access token available for the other user using cryptography? (the token should be signed also by the one that get access to the file. Create an access token that is signed by a Bob and is granted to Alice so that only Alice can use this token to access a content.
The Bobs token can't be used directly because he has specified an Alice in a token 'subject' so this token should be wrapped into another token that is signed by Alice: https://github.com/Cerebellum-Network/cere-ddc-sdk-js/blob/main/examples/node/7-private-bucket-access-sharing/index.ts
- List files (own + got shared), should be a get endpoint in the nextjs app, just query the db
- PDF visualizer

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
