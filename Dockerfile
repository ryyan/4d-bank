FROM node:10.10-alpine

EXPOSE 8888

WORKDIR /app
COPY . .

RUN apk add --no-cache --update python3 \
    && cd client \
    && npm install \
    && npm run build \
    && cd ../server \
    && npm install

CMD ["node", "server/index.js"]
