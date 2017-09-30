FROM node:alpine

EXPOSE 8888

WORKDIR /app
COPY . .

CMD ["node", "server/index.js"]
