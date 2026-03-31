# WaiCode - GitHub Clone

A modern, developer-focused platform for hosting and managing source code, built with Next.js 16, Prisma 7, and Tailwind CSS v4.

![image](https://github.com/vin-dev0/waicode/blob/main/waicode.png)

## Features

- **Authentication**: Secure signup and signin using NextAuth.js.
- **Repository Management**: Create public or private repositories.
- **Forks**: Fork any public repository to your own account.
- **Commits**: Track every file change with a detailed commit history.
- **Pull Requests**: Open, track, and **compare/merge** merge requests with a built-in **Diff Viewer**.
- **File System**: Browse files, create new ones, and edit existing code directly in the browser with **recursive directory support**.
- **Code Viewing**: High-performance blob viewer with syntax highlighting for multiple languages.
- **Markdown Support**: Full Markdown rendering for `README.md` files, issues, and comments.
- **Collaboration**: 
  - **Issues**: List, create, comment on, and manage (open/close) tasks.
  - **Pull Requests**: Open, track, and **merge/close** merge requests.
- **Social**: 
  - **Stars**: Star repositories to show appreciation and track projects.
  - **Follows**: Follow other developers to stay updated on their work.
  - **Feed**: Discover public repositories via the global dashboard feed.
- **Search**: Functional search bar for repositories and users.
- **Profiles**: Personalized user profile pages showing repositories and activity.
- **Settings**: Repository owners can manage settings and delete repositories.

## Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **ORM**: [Prisma 7](https://www.prisma.io/)
- **Database**: [SQLite](https://www.sqlite.org/) with `better-sqlite3` adapter
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Auth**: [NextAuth.js](https://next-auth.js.org/)
- **Markdown**: [react-markdown](https://github.com/remarkjs/react-markdown)

## Getting Started

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  Set up the database:
    ```bash
    npx prisma db push
    npx prisma generate
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open [http://localhost:3000](http://localhost:3000) in your browser.

