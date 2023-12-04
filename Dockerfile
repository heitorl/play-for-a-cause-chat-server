FROM node:18-alpine
# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

# Install app dependencies
RUN npm install --force
RUN apk --no-cache add build-base
RUN npx prisma generate

COPY . .



EXPOSE 3333
CMD [ "npm", "run", "start:dev" ]









