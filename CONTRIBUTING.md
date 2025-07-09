# Contributing to NodeOpti

First off, thank you for considering contributing to NodeOpti! We love community contributions. Every bit helps, and we welcome you to our team.

This document provides guidelines for contributing to the project.

## How Can I Contribute?

There are many ways you can contribute to NodeOpti:

-   **Reporting Bugs:** If you find a bug, please open an issue on our [GitHub Issues page](https://github.com/LMLK-seal/NodeOpti/issues). Please include a clear title, a description of the bug, and steps to reproduce it.
-   **Suggesting Enhancements:** Have an idea for a new feature or an improvement to an existing one? Open an issue with a clear proposal. We'd love to hear it.
-   **Submitting Code:** You can contribute directly to the codebase by submitting a Pull Request.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior.
*(Note: We will create this file in a later step if you wish. For now, this is a good placeholder.)*

---

## Setting Up Your Development Environment

Ready to write some code? Here’s how to get your development environment set up.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18.x or later recommended)
-   [npm](https://www.npmjs.com/) (usually comes with Node.js)
-   [Git](https://git-scm.com/)

### Setup Steps

1.  **Fork and Clone the Repository**
    -   First, [fork](https://github.com/LMLK-seal/NodeOpti/fork) the repository to your own GitHub account.
    -   Then, clone your fork to your local machine:
        ```bash
        git clone https://github.com/your-username/NodeOpti.git
        cd NodeOpti
        ```

2.  **Install Dependencies**
    -   Install all the required packages for development.
        ```bash
        npm install
        ```

3.  **Link for Local Testing (Crucial Step!)**
    -   To test your local changes using the `nodeopti` command in your terminal, you need to create a symbolic link.
        ```bash
        npm link
        ```
    -   This command tells your system that whenever you type `nodeopti`, it should run the code from *this project folder*, not the globally installed version from NPM.

4.  **Run the Tests**
    -   Before making any changes, ensure all existing tests are passing.
        ```bash
        npm test
        ```

You are now ready to start developing!

---

## Submitting a Pull Request

1.  Create a new branch for your feature or fix from the `main` branch. Please use a descriptive name.
    ```bash
    # For a new feature
    git checkout -b feature/new-amazing-codemod

    # For a bug fix
    git checkout -b fix/tree-visualizer-bug
    ```
2.  Make your code changes.
3.  Add new tests for your changes if applicable.
4.  Ensure all tests still pass with `npm test`.
5.  Commit your changes with a clear, descriptive commit message. We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard.
    ```bash
    git commit -m "feat: Add new codemod for date-fns library"
    ```
6.  Push your branch to your fork on GitHub.
    ```bash
    git push origin feature/new-amazing-codemod
    ```
7.  Go to the original NodeOpti repository on GitHub and open a Pull Request. Please provide a clear description of your changes.

## Coding Style

-   Please try to match the existing coding style and formatting in the project.
-   We use `const` where possible and prefer modern JavaScript features where appropriate.
-   Comment your code where the logic is complex or non-obvious.

Thank you again for your contribution!