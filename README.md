# LLM Router Project

## Overview

This project is a Next.js application that intelligently routes user requests to the most appropriate Large Language Model (LLM) based on the nature and complexity of the input. It leverages the OpenRouter API to access various LLMs and dynamically selects the best model for each request, optimizing for performance and cost.

## Features

-   **Intelligent LLM Routing:** Automatically selects the most suitable LLM (e.g., `anthropic/claude-sonnet-4`, `openai/gpt-5-mini`, `openai/gpt-oss-20b`) based on the user's input.
-   **Next.js App Router:** Built using the latest Next.js features, including Server Components and API routes.
-   **React Components:** Utilizes functional React components and hooks for a modern and maintainable codebase.
-   **OpenRouter API:** Integrates with OpenRouter to provide access to a wide range of LLMs.
-   **Markdown Support:** Renders LLM responses in Markdown format using `react-markdown` and `remark-gfm`.
-   **Animated Text:** Uses animated text to display the LLM responses.
-   **Environment Variable Validation:** Uses Zod to validate environment variables.
-   **Customizable UI:** Styled with Tailwind CSS for a responsive and customizable user interface.

## Technologies Used

-   [Next.js](https://nextjs.org/) - React framework for building performant web applications.
-   [React](https://reactjs.org/) - JavaScript library for building user interfaces.
-   [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript.
-   [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework for rapid UI development.
-   [OpenRouter API](https://openrouter.ai/) - Unified API for accessing multiple LLMs.
-   [Zod](https://github.com/colinhacks/zod) - TypeScript-first schema validation with static type inference.
-   [React Markdown](https://github.com/remarkjs/react-markdown) - React component to render Markdown.
-   [Remark GFM](https://github.com/remarkjs/remark-gfm) - Remark plugin to support GitHub Flavored Markdown.

## Project Structure

The project structure follows Next.js conventions with a focus on modularity and maintainability:

-   `src/app`: Contains the Next.js application routes and page components.
    -   `api/chat`: API route for handling chat requests and LLM routing.
    -   `page.tsx`: Main page component with the chat interface.
-   `src/components/ui`: Reusable UI components.
    -   `button.tsx`: Custom button component.
    -   `loader-dots.tsx`: Loading animation component.
-   `src/config`: Configuration files.
    -   `env.ts`: Environment variable validation and configuration.
-   `src/utils`: Utility functions.
    -   `logger.ts`: Logger utility for consistent logging.
-   `.env`: Environment variables (API keys, etc.).
-   `next.config.js`: Next.js configuration file.
-   `postcss.config.js`: PostCSS configuration file.
-   `tailwind.config.js`: Tailwind CSS configuration file.
-   `tsconfig.json`: TypeScript configuration file.

## Setup Instructions

Follow these steps to set up the project locally:

### Prerequisites

-   Node.js (version 18 or higher)
-   npm or yarn
-   An OpenRouter API key

### Installation

1.  Clone the repository:

    ```shell
    git clone <repository-url>
    cd llm-router-project
    ```

2.  Install dependencies:

    ```shell
    npm install
    # or
    yarn install
    ```

3.  Create a `.env` file in the project root and add your OpenRouter API key:

    ```dotenv
    OPENROUTER_API_KEY=sk-or-your-api-key
    ```

4.  Run the development server:

    ```shell
    npm run dev
    # or
    yarn dev
    ```

    Open your browser and navigate to `http://localhost:3000` to see the application running.

## Environment Variables

The following environment variables are required for the application to function correctly:

-   `OPENROUTER_API_KEY`: Your OpenRouter API key.

Ensure that these variables are set in your `.env` file.

## Usage

1.  Enter your message in the input field.
2.  Click the "Send" button or press "Enter".
3.  The application will route your message to the most appropriate LLM and display the response.

## LLM Routing Logic

The `llmRouter` function in `src/app/api/chat/route.ts` is responsible for routing user messages to the appropriate LLM. It uses a prompt to instruct a routing model (`google/gemini-2.5-flash-lite`) to select the best model based on the message content.

The available models and their use cases are:

-   `anthropic/claude-sonnet-4`: Best for complex and advanced coding tasks.
-   `openai/gpt-5-mini`: Best for non-code tasks requiring advanced reasoning or deep analysis.
-   `openai/gpt-oss-20b`: Best for simple coding tasks and general, non-reasoning questions.

The function returns an object containing the selected model, its specifications (context, latency, throughput, pricing), and an explanation of why the model was chosen.

## UI Components

The application uses several custom UI components to provide a clean and user-friendly interface:

-   `Button`: A custom button component with Tailwind CSS styling.
-   `LoaderDots`: A loading animation component that displays animated dots.
-   `BotMessage`: A component that renders the bot's message in Markdown format.
-   `AnimatedText`: A component that displays text with a typing animation.

## Global CSS

The `src/app/globals.css` file contains global CSS styles for the application, including:

-   Tailwind CSS base styles, components, and utilities.
-   Custom CSS variables for background and foreground colors.
-   Styles for the Markdown rendering.

## Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue or submit a pull request.

## License

[MIT](LICENSE)
