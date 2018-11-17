FROM mhart/alpine-node:10.13.0 as semantix
RUN apk add --no-cache git && \
    npm install -g semantix