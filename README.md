# Rick & Morty API

App in the development.

## Endpoints

- POST /register
- POST /login
```
body {
    "email": string
    "password": string
}
```
## Prerequisites

.env file is required, example
```
PORT=3500
DATABASE_URI=<some mongo db>
TOKEN_SECRET<some hash>
```

## Next steps
- logger
- CORS
- auth middleware
- rick and morty api adapter


## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.

### `npm test`


