FROM node:20

ENV TZ=America/Lima

RUN apt-get update && apt-get install -y tzdata

WORKDIR /app
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
