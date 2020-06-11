FROM node:12.0.0-alpine

COPY . .
RUN npm install

EXPOSE 3000

CMD ["npm", "start"]