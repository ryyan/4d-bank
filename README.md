# 4D Bank

Personal banking taken to the next dimension.

Written with the MEAN stack.

## Build

```
docker-compose build
```

### Run

```
docker-compose run -p 8888:8888 -T web
```

#### Development

```
docker-compose run -p 8888:8888 web sh
cd client
yarn run watch &
cd ..
node server/index.js
```
