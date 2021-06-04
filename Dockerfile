FROM node:16.1.0

RUN apt-get update

WORKDIR /code/

ADD package.json package-lock.json /code/

RUN npm install

ADD test /code/test

ENTRYPOINT "/bin/sh"
