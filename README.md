# Smart README Generator

A frontend-only React application for building polished README files with GitHub profile integration, live markdown preview, theme switching, and export actions.

## Features

- Responsive split-screen UI with form and live preview
- Dark / light theme toggle persisted in local storage
- GitHub username lookup for profile details and top repositories
- Conditional optional sections: Contributing, Credits, FAQ
- Markdown rendered live using `react-markdown`
- Copy to clipboard and `README.md` download
- Toast notifications, loading states, and clean developer-focused styling

## Installation

1. Open `index.html` in your browser.
2. Fill out the form and enter a GitHub username.
3. Click **Generate README**.
4. Copy the generated README or download it as `README.md`.

## Files

- `index.html` — main app shell and CDN dependencies
- `style.css` — responsive UI and theme styles
- `script.jsx` — React component app logic
- `githubService.js` — GitHub API service helper

## Notes

- Uses public GitHub API endpoints; no backend required.
- Theme mode respects system preference by default.
- The rendered preview is styled to look similar to GitHub README formatting.
