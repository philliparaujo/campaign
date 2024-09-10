# CAMPAIGN
Campaign is a turn-based, two-player strategy game centered around winning a city election. Players strategically place advertisements around the city to gather support and secure victory.

## Demo
See the app live: https://campaign.lunenetworks.com/

## Local Setup
#### Prerequisites
- Node.js (^18.17.1)
- npm (^9.6.7)
  
Follow these instructions to set up the project and run it locally. The project is divided into three main directories: `shared`, `client`, and `server`, each of which has dependencies to be installed and linked.

```
Client --- +
           |
           + --> Types
           |
Server --- +
```

1. Clone the repository: `git clone https://https://github.com/philliparaujo/campaign`
2. Enter the project directory: `cd campaign`
3. `campaign>`: Initialize submodules by running `git submodule update --init --recursive`
4. `campaign\shared>`: Run `npm install` and `npm link`
5. `campaign\client>`: Run `npm install` and `npm link shared`
6. `campaign\server>`: Run `npm install` and `npm link shared`

### Local Build
To see the project running locally, follow these steps.

1. In a terminal, navigate to the `server` directory and start the server with `npm run dev`.
2. Open a second terminal and navigate to the `client` directory to start the front-end with `npm run dev`.
3. Open your browser and navigate to http://localhost:3000 to view the app.

### Production Build
To build the project for production (so that changes can be shared on the demo link), follow these steps.

1. If any changes were made on the front-end, navigate to the `client` directory. `git add .`, `git commit -m <commit-message>`, `git push`. These changes should be pushed to the `release/webapp` branch.
2. If any changes were made on the server, navigate to the `server` directory. `git add .`, `git commit -m <commit-message>`, `git push`. These changes should be pushed to the `release/server` branch.
3. Wait up to one minute for changes to be seen on the demo page. Confirm that the latest build times match your commits.

## Project Structure
### Client
- **Assets:** Contains images and static files used by the client (e.g., the homepage background).
- **Components:** Defines reusable UI components, such as the game board, modals, buttons, and other visual elements.
- **Pages:** Organizes page-level components (e.g., homepage, game page).
- **States:** Manages the client-side state, including the logic for creating, joining, and leaving games, and interacts with the server to sync game state.
### Server
- **Models:** Defines database schemas for storing game data, player information, and game state.
- `index.ts`: The server's entry point, responsible for starting the server and defining core API routes.
### Shared
- **GameSettings:** Centralizes game constants like board size, starting coins, and the number of turns.
- **Types:** Defines custom types used throughout the project.
- **Utils:** Contains utility functions used throughout the project, especially regarding game logic.
