# Full Stack Grab using Reactjs, Socket.io, Node.js Flutter

# Enviroments

node v18.17.0

# Stack

    React (lastest)
    Vite (lastest)
    Typescript
    Tanstack/react-query (lastest)
    Expressjs (lastest)
    Prisma (lastest)

# Installation

Setup Server

```bash
  cd server
  yarn install
  npx prisma generate
  npx prisma migrate dev --name initial
  npx prisma migrate deploy

```

## docker-compose

```bash
docker-compose up -d
```

## Manual

add environment variables in the server's .env file

```bash
    PORT=6666
```

In the `DATABASE_URL` you can add any databse url.

Run Server

```bash
  cd server
  yarn start

```

Then server start at localhost:6060

Setup Client

```bash
  cd client
  yarn install
  yarn dev
```

Then open localhost:5173

# API Spec

## socket io

```bash

     customer:
        listen:
            online-driver : {driverId, location: {lat, long}}
            offline-driver: {driverId}
            accept:  {driverId, location: {lat, long}}
            complete
            pick
        emit:
            add-customer:{ customerId, location:{lat, long} }
            cancel: { driverId?, customerId? }
            remove-customer : {customerId}

    driver:
        listen:
            online-customer: {customerId, location: {lat, long}}
            offline-customer: {customerId}
            cancel: { driverId, customerId }
        emit:
            add-driver : { driverId, location:{lat, long} }
            remove-driver: {driverId}
            accept: { driverId, customerId }
            complete

```

## Rest

```bash
    POST /api/auth/check-user  Body: {"phone": ""}
    POST /api/auth/on-board-user  Body: {"phone": "", "name":"", "userType": "DRIVER","CUSTOMER", "maxDistance": }

    POST /api/rides  Body: {customerId,startLocation,endLocation,startAddress,endAddress, distance} #create  booking now
    POST /api/rides  Body: {phone,startLocation,endLocation,startAddress,endAddress, scheduleTime} #schedule booking later
    POST /api/rides/cancel  Body: {rideId}
    POST /api/rides/accept  Body: {rideId, driverId}
    POST /api/rides/complete  Body: {rideId}
    POST /api/rides/pick  Body: {rideId}
    GET  /api/rides/current?driverId=3  # if get rides of drivers : pass driverId in query otherwise customerId for customer
    GET /api/rides?driverId=3 # same above

```
