# Three.js Framework for Terra Numerica

This project aims to create a framework based on **Three.js** to assist in future projects for **Terra Numerica**.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Java**
- **Node.js**
- **npm** (Node Package Manager)
- **npx** (Node Package Executor)
- **vite**

## Getting Started

To initialize a project, you can use the `main` branch to pull the base structure of a Three.js application. Follow these steps:

1. **Clone the repository** (replace `https://github.com/Kazenoyama/FrameworkThreeJS` with the actual URL):
    ```bash
    git clone https://github.com/Kazenoyama/FrameworkThreeJS
    ```
2. **Run the setup command** to install the necessary dependencies and create the project structure:
To only use the graphic chart and the navigation bar use this command :
    ```bash
    npm run setup
    ```
To add the part with 3D implementation, use this command :
    ```bash
    npm run setup3D
    ```
3. **Start the development server** using Vite:
    ```bash
    npx vite
    ```

## Project Structure

After running the `npm run setup` command, the following directory structure will be created:


### Key Files and Their Purpose

- **`index.html`**: The entry point of your application. This file includes references to your main JavaScript file and any necessary stylesheets.

- **`package.json`**: Contains metadata about your project, including dependencies, scripts, and configuration settings for npm.

- **`src/css/style.css`**: A stylesheet for styling your application. You can customize this file to adjust the look and feel of your project.

- **`src/js/main.js`**: The main JavaScript file where you'll set up your Three.js scene, including creating a renderer, camera, and any 3D objects.

- **`src/modele/`**: This folder is intended for storing 3D models and other assets you may use in your application.

## Additional Setup

If you need to make further adjustments or configurations, consider the following:

- **Dependencies**: Ensure that you have all necessary dependencies installed by running:
    ```bash
    npm install
    ```


## Documentation
- [Changelog](CHANGELOG.md)
- [Documentation](DOCUMENTATION.md)
- [License](LICENSE)
