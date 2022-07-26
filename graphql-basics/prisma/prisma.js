import { PrismaClient } from "@prisma/client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

if (!global.prisma) global.prisma = new PrismaClient();
let prisma = global.prisma;

export default prisma;
