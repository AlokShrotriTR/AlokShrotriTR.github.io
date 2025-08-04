# ACTR - Microsoft Teams App

## Overview
ACTR is a Microsoft Teams application designed to facilitate incident reporting and management. Users can input incident numbers in a specific format, and the app interacts with the Microsoft Teams API to handle notifications and messages related to these incidents.

## Features
- User-friendly interface for incident number input.
- Validation of incident numbers to ensure they meet the required format.
- Integration with Microsoft Teams for seamless communication.

## Project Structure
```
ACTR
├── src
│   ├── app.ts                # Entry point of the application
│   ├── components
│   │   ├── IncidentForm.tsx  # React component for incident number input
│   │   └── index.ts          # Exports components for easier imports
│   ├── services
│   │   └── teamsService.ts    # Functions for interacting with Microsoft Teams API
│   ├── utils
│   │   └── validation.ts      # Validation functions for input data
│   └── types
│       └── index.ts          # TypeScript interfaces and types
├── public
│   ├── index.html            # Main HTML file for the application
│   └── manifest.json         # Configuration for the Microsoft Teams app
├── package.json              # npm configuration file
├── tsconfig.json             # TypeScript configuration file
└── README.md                 # Documentation for the project
```

## Setup Instructions
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd ACTR
   ```
3. Install the dependencies:
   ```
   npm install
   ```
4. Start the application:
   ```
   npm start
   ```

## Usage
- Open the application in Microsoft Teams.
- Use the IncidentForm component to input an incident number in the format "INC1234567".
- The app will validate the input and interact with the Teams API as needed.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.