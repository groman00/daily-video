# Daily Video

## Getting Started

Set up environment settings

```
cp .env.example .env
<edit .env with your correct credentials>
```

Run Mongo Daemon
```
mongod
```

Run AfterFX in no ui mode
```
afterfx --noui
```

Install Dependencies
```
npm install
```

Build dev app
```
npm run dev
```

Build dev app and watch for file changes
```
npm run watch
```

Build prod app
```
npm run prod
```

Run Express Server
```
npm run start
```

Deploy app for production.  Builds prod assets and uploads to cdn, runs app daemon in background
```
npm run deploy
```

Stop production app
```
npm run stop
```
