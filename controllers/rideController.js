import getPrismaInstance from "../utils/prismaClient.js";
import { Prisma } from "@prisma/client";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

export const book = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();

    const {
      phone,
      startLocation,
      endLocation,
      startAddress,
      endAddress,
      scheduleTime,
      customerId,
      distance,
    } = req.body;

    if (
      !startLocation ||
      !endLocation ||
      !startAddress ||
      !endAddress ||
      !distance
    ) {
      return res.error(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }

    let booking;

    if (scheduleTime) {
      if (!phone) {
        return res.error(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
      }
      booking = await prisma.rides.create({
        data: {
          phone,
          startLocation: `${startLocation.lat}-${startLocation.long}`,
          endLocation: `${endLocation.lat}-${endLocation.long}`,
          startAddress,
          endAddress,
          scheduleTime,
          distance,
        },
      });
    } else {
      if (!customerId) {
        return res.error(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
      }

      const isExistBooking = await prisma.rides.findFirst({
        where: {
          customerId: customerId,
          status: {
            in: ["ACCEPTED", "PENDING"],
          },
        },
      });

      if (isExistBooking) {
        return res.error(StatusCodes.BAD_REQUEST, "Exist booking");
      }

      booking = await prisma.rides.create({
        data: {
          customerId,
          startLocation: `${startLocation.lat}-${startLocation.long}`,
          endLocation: `${endLocation.lat}-${endLocation.long}`,
          startAddress,
          endAddress,
          distance,
        },
      });
    }

    //  const booking = await  prisma.$queryRaw( Prisma.sql`
    //  INSERT INTO "Rides" (phone, startLocation, endLocation,startAddress, endAddress, scheduleTime ) VALUES ('${phone}', '(${startLocation.lat},${startLocation.long})',
    //    '(${endLocation.lat}, ${endLocation.long})', '${startAddress}', '${endAddress}', '${scheduleTime}')
    //  `)

    return res.success(
      { msg: "schedule successfully", data: booking },
      StatusCodes.CREATED,
      ReasonPhrases.CREATED
    );
  } catch (err) {
    next(err);
  }
};

export const cancel = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();

    const { rideId } = req.body;

    if (!rideId) {
      return res.error(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }
    const getRide = await prisma.rides.findUnique({
      where: {
        id: rideId,
      },
    });
    if (!["PENDING", "ACCEPTED"].includes(getRide.status)) {
      return res.error(StatusCodes.BAD_REQUEST, "Ride is not allow to cancel");
    } else {
      await prisma.rides.update({
        where: {
          id: rideId,
        },
        data: {
          status: "CANCELLED",
        },
      });
    }

    return res.success(
      { msg: "cancel successfully", data: { result: true } },
      StatusCodes.OK,
      ReasonPhrases.OK
    );
  } catch (err) {
    next(err);
  }
};

export const accept = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();

    const { rideId, driverId } = req.body;

    if (!rideId || !driverId) {
      return res.error(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }
    const getRide = await prisma.rides.findUnique({
      where: {
        id: rideId,
      },
    });
    if (getRide.status !== "PENDING") {
      return res.error(StatusCodes.BAD_REQUEST, "Ride is not pending");
    } else {
      await prisma.rides.update({
        where: {
          id: rideId,
        },
        data: {
          status: "ACCEPTED",
          startTime: new Date(),
          driverId: driverId,
        },
      });
    }

    // feature closed.

    // sendSMS({to: ''}).then((message) => {
    //   console.log("Send message successfull", message.sid);
    // });

    return res.success(
      { msg: "accept successfully", data: { result: true } },
      StatusCodes.OK,
      ReasonPhrases.OK
    );
  } catch (err) {
    next(err);
  }
};

export const pick = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();

    const { rideId } = req.body;

    if (!rideId) {
      return res.error(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }
    const getRide = await prisma.rides.findUnique({
      where: {
        id: rideId,
      },
    });
    if (getRide.status !== "ACCEPTED") {
      return res.error(StatusCodes.BAD_REQUEST, "Ride is not ACCEPTED");
    } else {
      await prisma.rides.update({
        where: {
          id: rideId,
        },
        data: {
          status: "IN_PROGRESS",
          startTime: new Date(),
        },
      });
    }

    return res.success(
      { msg: "accept successfully", data: { result: true } },
      StatusCodes.OK,
      ReasonPhrases.OK
    );
  } catch (err) {
    next(err);
  }
};

export const complete = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();

    const { rideId } = req.body;

    if (!rideId) {
      return res.error(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }

    const getRide = await prisma.rides.findUnique({
      where: {
        id: rideId,
      },
    });
    if (getRide.status !== "IN_PROGRESS") {
      return res.error(StatusCodes.BAD_REQUEST, "Ride is not in progress");
    } else {
      await prisma.rides.update({
        where: {
          id: rideId,
        },
        data: {
          status: "COMPLETED",
          endTime: new Date(),
        },
      });
    }
    return res.success(
      { msg: "completed ", data: { result: true } },
      StatusCodes.OK,
      ReasonPhrases.OK
    );
  } catch (err) {
    next(err);
  }
};

export const getCurrentRides = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();

    const { customerId, driverId } = req.query;

    if (!customerId && !driverId) {
      return res.error(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }

    let condition = {
      status: {
        in: ["ACCEPTED", "PENDING", "IN_PROGRESS"],
      },
    };

    if (customerId) {
      condition = {
        ...condition,
        customerId: parseInt(customerId),
      };
    } else {
      condition = {
        ...condition,
        driverId: parseInt(driverId),
      };
    }
    const currentRides = await prisma.rides.findMany({
      where: condition,
    });

    return res.success(
      { msg: "retrieve successfully", data: currentRides },
      StatusCodes.OK,
      ReasonPhrases.OK
    );
  } catch (err) {
    next(err);
  }
};

export const getHistories = async (req, res, next) => {
  try {
    const prisma = getPrismaInstance();

    const { customerId, driverId } = req.query;

    if (!customerId && !driverId) {
      return res.error(StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }

    let condition = {};
    if (customerId) {
      condition = {
        ...condition,
        customerId: parseInt(customerId),
      };
    } else {
      condition = {
        ...condition,
        driverId: parseInt(driverId),
      };
    }

    const histories = await prisma.rides.findMany({
      where: condition,
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.success(
      { msg: "retrieve successfully", data: histories },
      StatusCodes.OK,
      ReasonPhrases.OK
    );
  } catch (err) {
    next(err);
  }
};
