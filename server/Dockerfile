FROM node

COPY . /app
WORKDIR /app

RUN npm install

ENV PORT=80

CMD ["node", "index.js"]