FROM node:12.0.0-alpine

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]