FROM node:14.4.0-alpine

COPY . .

EXPOSE 3000

CMD ["node", "dist/server/index.js"]