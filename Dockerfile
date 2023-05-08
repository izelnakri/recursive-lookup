FROM node:20.1.0-alpine

WORKDIR /code/

ADD index.js /code/
ADD test /code/test

ENTRYPOINT "/bin/sh"
