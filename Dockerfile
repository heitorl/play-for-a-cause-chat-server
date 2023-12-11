FROM node:18-alpine
# Create app directory
USER node

RUN mkdir -p /home/node/app

WORKDIR /home/node/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package.json package-lock.json
COPY --chown=node:node prisma ./prisma/
COPY --chown=node:node . .

# Install app dependencies
RUN npm install --force
RUN npx prisma migrate deploy

RUN npx prisma generate
RUN npm run build
EXPOSE 3333
CMD [ "npm", "run", "start:prod" ]









