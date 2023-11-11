import { Server } from "socket.io";
import { Allow_Origins } from "../../configs/env.js";
import getPrismaInstance from "../../utils/prismaClient.js";
import logger from "../../services/logger/index.js";

const socketServer = (app) => {
  const io = new Server(app, {
    cors: {
      origin: Allow_Origins,
      credentials: true,
    },
  });

  console.log(`socketServer run at ${process.env.PORT}`);
  global.onlineCustomers = new Map();
  global.onlineDrivers = new Map();
  global.rides = new Map();
  global.orders = new Map();

  const ROOM = {
    CUSTOMER: "CUSTOMER",
    DRIVER: "DRIVER",
  };

  io.on("connection", (socket) => {
    global.grabSocket = socket;
    logger.info(`new user -  socketId :${socket.id} `);

    // drivers
    socket.on("add-driver", async (payload) => {
      try {
        const data = JSON.parse(payload);
        const { driverId, location } = data;
        logger.info(`add-drivers -  driverId:${driverId} `);

        if (!driverId || !location) {
          return;
        }
        onlineDrivers.set(driverId, {
          socketId: socket.id,
          location,
        });

        // join room
        logger.info(`Join Room : ${ROOM.DRIVER} - driverId: ${driverId}`);

        socket.join(ROOM.DRIVER);

        logger.info(
          `Emit to Room : ${ROOM.CUSTOMER}- online-drivers, ${JSON.stringify(
            onlineDrivers
          )}`
        );

        socket.broadcast.to(ROOM.CUSTOMER).emit("online-driver", payload);
      } catch (error) {
        logger.error(`add-drivers - ${error}`);
      }
    });

    socket.on("remove-driver", async (payload) => {
      try {
        const data = JSON.parse(payload);
        const { driverId } = data;

        logger.info(`remove-drivers: driverId- ${driverId}`);

        if (!driverId) {
          return;
        }
        onlineDrivers.delete(driverId);

        logger.info(`Emit to Room : ${ROOM.CUSTOMER} - online-drivers`);

        socket.broadcast.to(ROOM.CUSTOMER).emit("offline-driver", payload);
      } catch (error) {
        logger.error(`remove-drivers - ${error}`);
      }
    });

    // create room
    socket.on("accept", (payload) => {
      try {
        const data = JSON.parse(payload);
        const { driverId, customerId } = data;
        if (!driverId || !customerId) {
          return;
        }
        logger.info(
          `accept - driverId: ${driverId}- customerId:  ${customerId}`
        );

        //get current info
        const customer = onlineCustomers.get(customerId);
        const driver = onlineCustomers.get(driverId);

        // match room
        rides.set(customerId, { ...driver, driverId });
        orders.set(driverId, { ...customer, customerId });

        // remove waiting list
        onlineDrivers.delete(driverId);
        onlineCustomers.delete(customerId);

        logger.info(`accept - driverId: ${driverId}, customerId:${customerId}`);

        logger.info(
          `Emit to Room : ${ROOM.DRIVER} - online-customers- remove customer ${customerId}`
        );

        socket.broadcast
          .to(ROOM.DRIVER)
          .emit("offline-customer", JSON.stringify({ customerId }));

        logger.info(
          `Emit to Room : ${ROOM.DRIVER} - online-drivers - remove driver ${driverId}`
        );

        socket.broadcast
          .to(ROOM.CUSTOMER)
          .emit("offline-driver", JSON.stringify({ driverId }));

        logger.info(
          `Emit to Customer ${customerId} - accept - driver ${driverId}`
        );

        // send to customer
        socket
          .to(customer.socketId)
          .emit("accept", JSON.stringify({ ...driver, driverId }));
      } catch (error) {
        logger.error(`add-customers - ${error}`);
      }
    });

    // delete room
    socket.on("complete", (payload) => {
      try {
        const data = JSON.parse(payload);
        const { driverId, customerId } = data;
        if (!driverId || !customerId) {
          return;
        }

        const customer = orders.get(driverId);

        if (customer) {
          socket.to(customer.socketId).emit("complete");
        }
        logger.info(`Emit to Customer ${customerId} - completed `);

        rides.delete(customerId);
        orders.delete(driverId);
      } catch (error) {
        logger.error(`complete- ${error}`);
      }
    });

    socket.on("cancel", (payload) => {
      try {
        const data = JSON.parse(payload);
        const { driverId, customerId } = data;
        if (!driverId || !customerId) {
          return;
        }
        const driver = rides.get(customerId);

        if (driver) {
          socket.to(driver.socketId).emit("cancel");
        }

        if (driverId) {
          logger.info(`Emit to driver ${driverId} - cancel `);
          orders.delete(driverId);
          rides.delete(customerId);
        } else {
          onlineCustomers.delete(customerId);
          socket.broadcast
            .to(ROOM.DRIVER)
            .emit("offline-customer", JSON.stringify({ customerId }));
        }
      } catch (error) {
        logger.error(`cancel - ${error}`);
      }
    });

    socket.on("pick", (payload) => {
      try {
        const data = JSON.parse(payload);
        const { driverId, customerId } = data;

        if (!driverId || !customerId) {
          return;
        }

        const driver = rides.get(customerId);
        const customer = orders.get(driverId);

        if (driver) {
          socket.to(customer.socketId).emit("pick");
        }
        logger.info(`Emit to customer ${customerId} - pick `);
      } catch (error) {
        logger.error(`pick- ${error}`);
      }
    });

    // customers

    socket.on("add-customer", async (payload) => {
      try {
        const data = JSON.parse(payload);
        logger.info(`add-customers ${payload} `);

        const { customerId, location } = data;

        if (!customerId || !location) {
          return;
        }

        if (!customerId || !location) {
          return;
        }

        onlineCustomers.set(customerId, {
          socketId: socket.id,
          location,
        });

        socket.join(ROOM.CUSTOMER);
        logger.info(`Emit to room ${ROOM.DRIVER} - online-customer `);

        socket.broadcast.to(ROOM.DRIVER).emit("online-customer", payload);
      } catch (error) {
        logger.error(`add-customers - ${error}`);
      }
    });

    socket.on("remove-customer", async (payload) => {
      try {
        const data = JSON.parse(payload);
        const { customerId } = data;

        if (!customerId) {
          return;
        }

        onlineCustomers.delete(customerId);
        logger.info(`remove-customer ${customerId} `);

        logger.info(`Emit to room ${ROOM.DRIVER} - online-driver `);
        socket.broadcast.to(ROOM.DRIVER).emit("offline-customer", payload);
      } catch (error) {
        logger.error(`remove-customers - ${error}`);
      }
    });

    socket.on("disconnect", () => {
      logger.info("disconnect", socket.id);

      if (onlineCustomers.has(socket.id)) {
        onlineCustomers.delete(socket.id);

        socket.broadcast.to(ROOM.DRIVER).emit("online-customers", {
          onlineCustomers: onlineCustomers,
        });
      } else if (onlineDrivers.has(socket.id)) {
        onlineDrivers.delete(socket.id);

        socket.broadcast.to(ROOM.CUSTOMER).emit("online-drivers", {
          onlineDrivers: onlineDrivers,
        });
      }
    });
  });
};

export default socketServer;

/*
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
*/
