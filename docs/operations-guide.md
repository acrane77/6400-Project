# Operations Guide

## Deployment

Ensure Node.js, Yarn and Java are installed. From the root directory of the repository, run:

```bash
yarn install
./run_demo.sh
```

The application can then be accessed at `http://localhost:3000`. Local deployment was chosen to simplify demonstration and avoid hosting costs.

## Configuration

The environment variables are configured by `run_demo.sh`, and the Firebase emulator configuration is stored in `firebase.json`.

## Shutdown and Rollback

To stop the application, press Ctrl+C in the terminal. If an update causes issues, check out a previous working commit, reinstall the dependencies and restart the application. This rolls back the code, not the database contents.

## Health Checks

To verify that the system is working, open the website and test account registration, login and event creation. The Firebase Emulator UI can be accessed at `http://localhost:4000` to inspect stored data.

The results of the automated tests and build checks can be viewed under the Actions tab of the GitHub repository.

## Troubleshooting

If the application fails to start, ensure all dependencies are installed and the required ports are available. Errors can be investigated using the terminal output.

## Runtime Debugging

Monitor the Firebase UI to debug the backend operations and authentication. The frontend application can be debugged by making changes to files while the application is deployed and observing the result in a browser.
