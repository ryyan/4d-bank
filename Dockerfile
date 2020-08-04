FROM node:alpine

EXPOSE 8888

WORKDIR /app
COPY . .

RUN cd client \
    && npm install \
    && npm run build \
    && cd ../server \
    && npm install

CMD ["node", "server/index.js"]
