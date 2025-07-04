Film Tools
Welcome to Film Tools! This is a web-based application built with Next.js and Tailwind CSS, designed to help screenwriters and directors visually plan their projects. It provides a powerful interface for script analysis, emotion tracking, and storyboard creation.

Note: This project is a functional clone and learning exercise based on the excellent tool created by Jalex Rosa, which can be found at https://tools.youny.tv/. A big thank you to the original author for the inspiration!

Features
Table & Analysis View: A detailed table for your script segments.

Editable Script: Directly edit script text in-line.

Hierarchical Structure: Add, delete, indent, and outdent script lines with automatic numbering (e.g., 1, 1.1, 1.1.1).

Emotion Tracking: Visually edit emotion values (Interest, Tension, etc.) for each scene using interactive sliders.

Customizable Emotions: Add or remove the emotions you want to track via a simple pop-up menu.

Storyboard View: A separate, dedicated space to visually plan your shots.

Grid & List Layouts: View your storyboard panels in a flexible grid or a detailed list.

Aspect Ratio Control: Switch between widescreen (16:9), square (1:1), and vertical (9:16) aspect ratios for your image panels.

Data Portability:

Export to JSON: Save your entire project—including script data, storyboard panels, and all images—to a single JSON file.

Import from JSON: Load a previously saved project to continue your work.

Reset: Easily reset the application to its initial state.

Getting Started
Follow these steps to get the project running on your local machine.

Prerequisites
Node.js: You must have Node.js installed on your system. Version 20.x or newer is recommended. You can download and install it from the official Node.js website.

A package manager: npm is included with Node.js. You can also use yarn or pnpm.

Installation & Setup
Clone the repository or download the source code.

Navigate to the project directory in your terminal:

cd path/to/your/film-tools

Install the project dependencies:

npm install

Run the development server:

npm run dev

Open your browser and navigate to http://localhost:3000 to see the application running.

The page will auto-update as you make edits to the code in app/page.tsx.

Deploy on Vercel
The easiest way to deploy your Next.js app is to use the Vercel Platform from the creators of Next.js.

Check out the Next.js deployment documentation for more details.
