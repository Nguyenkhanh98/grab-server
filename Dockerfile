
# Use the official Node 18 image as the base image
FROM node:18

ENV DB_HOST=dbFile=file:./prod.db

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

RUN npx prisma generate

RUN npx prisma migrate dev --name initial

RUN npx prisma migrate deploy

# Expose port 3000 for the Express.js server
EXPOSE 6666

# Start the Express.js server
CMD [ "npm", "start" ]
