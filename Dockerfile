FROM node:12.1.0-alpine

RUN mkdir /apps

WORKDIR /apps
ADD ./package-lock.json /apps/
ADD ./package.json /apps/
RUN npm install --only=production

ADD . /apps

ENV NODE_ENV production
