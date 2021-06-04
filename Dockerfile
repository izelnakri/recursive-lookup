FROM node:16.3.0-alpine

WORKDIR /code/

ADD package.json package-lock.json /code/

RUN npm install

ADD index.js /code/
ADD test /code/test

ENTRYPOINT "/bin/sh"
