import getPrismaInstance from "../utils/prismaClient.js";
import  { StatusCodes, ReasonPhrases } from 'http-status-codes';

export const checkUser = async (request, response, next) => {
  try {
    const { phone } = request.body;
    if (!phone) {
      return response.error({  msg: "Phone is required"}, StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }
    const prisma = getPrismaInstance();
    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      return response.error( StatusCodes.BAD_REQUEST, "User not found");
    } else
    return response.success({  data: user}, StatusCodes.OK, ReasonPhrases.OK);
  } catch (error) {
    next(error);
  }
};

export const onBoardUser = async (request, response, next) => {
  try {
    const {
      phone,
      name,
      maxDistance,
      userType = "CUSTOMER",
    } = request.body;
    if (!phone || !name ) {
      return response.error({  msg: "Email, Phone  are required"}, StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);
    }
    
    if (userType === "DRIVER" && !maxDistance) {
      return response.error({  msg: "maxDistance  are required"}, StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST);

    }

    const prisma = getPrismaInstance();
    await prisma.user.create({
      data: { phone, name, maxDistance, userType },
    });
      return response.success({ }, StatusCodes.OK, ReasonPhrases.OK);
  } catch (error) {
    next(error);
  }
};
