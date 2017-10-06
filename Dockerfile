FROM node:alpine

EXPOSE 8888

WORKDIR /app
COPY . .

RUN npm install -g yarn \
    && cd client \
    && yarn install \
    && yarn run build \
    && cd ../server \
    && yarn install

CMD ["node", "server/index.js"]
