# frontend/Dockerfile
FROM node:22

WORKDIR /app

COPY . package*.json ./
RUN npm install

COPY . .

RUN npm run build

RUN npm install 

EXPOSE 3001

CMD ["serve", "-s", "dist", "-l", "3001"]
