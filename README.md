# EmbedHerlad

A Cloudflare Worker that generates OpenGraph embeds (metadata) for the amazing avherald.com articles.

Currently hosted on `nuff.gay`. To use it, simply take an avherald.com URL and replace `avherald.com` with `nuff.gay`. For example: `https://avherald.com/h?article=50faa50b&opt=0` -> `https://nuff.gay/h?article=50faa50b&opt=0` which will yield this beautiful Discord embed:

![Discord message showing the generated embed](https://i.imgur.com/mMCU2mf.png)

## Running locally

### Using npm

```sh
$ npm i
$ npm run start-local
```

#### Exposing your instance to the Internet

To test your local instance on Discord or similar services, you will need to expose it to the Internet. You can do that using [localtunnel](https://theboroer.github.io/localtunnel-www/) by running the following commands _concurrently_. 

```sh
$ npx http-proxy -p 8001 6969 # necessary so that the tunnel does not close when restarting the application
$ npx lt -p 8001
$ npm run start-local
```

### Using Docker

```sh
$ npm run docker:build
$ npm run docker:run
```

### Using Docker Compose

```sh
$ npm run docker:compose
```

You can find the details of the docker-compose setup in `docker-compose.yml`.

## Deploying on Cloudflare

First, follow the [Cloudflare Getting Started guide](https://developers.cloudflare.com/workers/get-started/guide/) and create a new worker with the name `embedherald` (or one of your choosing, in which case you'll need to modify `wrangler.toml`).

Then, run:

```sh
$ npm i
$ npm run deploy
```

## Copyright

I did not write nor do I own any content on https://avherald.com.
