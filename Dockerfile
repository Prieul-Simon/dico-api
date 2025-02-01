######################################################
# Inspired by https://bun.sh/guides/ecosystem/docker
######################################################

# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.2.1-alpine AS base
WORKDIR /usr/src/app

# install dependencies (aka node_modules/) into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# EDIT: no production dependencies as build script will embed them into app.js (they won't be present for sourcemaps though)
# # install with --production (exclude devDependencies)
# RUN mkdir -p /temp/prod
# COPY package.json bun.lock /temp/prod/
# RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY package.json tsconfig.json app.ts ./
COPY src/ src/

# [optional] tests & build
ENV NODE_ENV=production
# RUN bun test
RUN bun run test
RUN bun run build-binary

# copy production dependencies and source code into final image
# EDIT: no production dependencies as build script will embed them into app.js (they won't be present for sourcemaps though)
FROM alpine:latest AS release
WORKDIR /usr/src/app
RUN adduser -D bun

# Install packages
RUN apk upgrade --no-cache && \
    apk add --no-cache libgcc libstdc++

# COPY --from=install /temp/prod/node_modules node_modules
# COPY --from=prerelease /usr/src/app/dist/ dist/
COPY --from=prerelease /usr/src/app/app .
# Also copy source files for linking in sourcemaps
COPY --from=prerelease /usr/src/app/app.ts .
COPY --from=prerelease /usr/src/app/src/ src/
# EDIT: need to copy some node_modules required during runtime
COPY --from=install /temp/dev/node_modules/figlet/fonts/Standard.flf node_modules/figlet/fonts/

# run the app
USER bun
EXPOSE 80/tcp
ENTRYPOINT [ "/usr/src/app/bin/dico-api" ]