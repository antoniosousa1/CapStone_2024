FROM node:22.14-slim

WORKDIR /frontend

COPY . .

RUN apt-get update && apt-get install -y curl

RUN npm install

CMD ["npm", "run", "dev"]