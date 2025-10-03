FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci || npm i

COPY . .

ENV PORT=8888
EXPOSE 8888

CMD ["npm", "run", "dev"]