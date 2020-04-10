CLI deployment:

Run build:
- cd client
- npm run build

Deploy to cloud:
- export GOOGLE_APPLICATION_CREDENTIALS="/Users/ysnappir/private/hanabi_deployment/hanabi/Hanabionline-auth.json"
- cd ..
- gcloud app deploy
