# EmbedHerlad

A Cloudflare Worker that generates OpenGraph embeds (metadata) for the amazing avherald.com articles.

Currently hosted on `nuff.gay`. To use it, simply take an avherald.com URL and replace `avherald.com` with `nuff.gay`. For example: `https://avherald.com/h?article=50faa50b&opt=0` -> `https://nuff.gay/h?article=50faa50b&opt=0` which will yield this beautiful Discord embed:

![Discord message showing the generated embed](https://i.imgur.com/mMCU2mf.png)

## Running locally

### With Docker

```
$ npm run docker:build
$ npm run docker:run
```

### With Docker Compose
```
$ npm run docker:compose
```

You can find the details of the docker-compose setup in `docker-compose.yml`.

### With NPM

```
$ npm i
$ npm run start-local
```

> [!NOTE]
> To test embeds on Discord or similar services, you need to expose your instance to the Internet. The simplest way to do that is by using a tunnel, such as [localtunnel](https://theboroer.github.io/localtunnel-www/).

## Deploying on Cloudflare

First, follow the [Cloudflare Getting Started guide](https://developers.cloudflare.com/workers/get-started/guide/) and create a new worker with the name `embedherald` (or one of your choosing, in which case you'll need to modify `wrangler.toml`).

Then, run:

```
$ npm i
$ npm run deploy
```

## TODO

- [ ] Landing page on https://nuff.gay/
- [ ] Deploying to CF automagically on commit (Github Actions)

## Copyright

I did not write nor do I own any content on avherald.com.
