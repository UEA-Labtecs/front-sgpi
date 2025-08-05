# frontend/Dockerfile
FROM node:22

WORKDIR /app

COPY . package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Usar um servidor estático em Node para evitar o Nginx
# Instalar o pacote serve globalmente
RUN npm install -g serve

EXPOSE 3001

CMD ["serve", "-s", "dist", "-l", "3001"]
