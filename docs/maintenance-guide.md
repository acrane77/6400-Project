# Maintenance Guide

## Development Environment

To begin developing or maintaining the application, follow the setup instructions provided in the README. The `run_demo.sh` script allows developers to run the application locally using the Firebase emulators without needing access to a production Firebase project.

## Codebase Organization

The application is organized by feature, with most of the application logic contained in the `features/` directory. The `app/` directory contains the application's pages and API endpoints, while reusable UI components are contained in the `components/` directory. When adding or modifying functionality, developers should follow the existing organization of the codebase. Changes to the frontend should make use of the existing UI components and centralized styling configuration to maintain consistency across the application. Changes to the backend should maintain the existing authentication and access control requirements.

## Development and Testing

When making changes to the application, developers should create a separate branch and submit a pull request once their changes are ready to be integrated. The continuous integration pipeline automatically builds the application and runs the test suite when changes are pushed. If any of these checks fail, the developer can view the output of the failed pipeline stage through GitHub Actions to determine what caused the failure. Developers should add tests when introducing new functionality and update existing tests when the intended behaviour of the application changes. Instructions for running the tests locally are included in the README. Changes should be reviewed by another developer before being merged into the main branch.

## Dependencies and Documentation

When updating dependencies, changes to both `package.json` and `yarn.lock` should be committed to the repository. The test suite should be executed following dependency updates to ensure that existing functionality has not been affected. The project's documentation should also be updated when changes are made to the application's functionality or configuration. Production credentials and private keys should never be committed to the repository.
