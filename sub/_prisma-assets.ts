import fs from 'fs';
import path from 'path';

// Trick to include schema.prisma
fs.readFileSync(path.join(__dirname, './prisma/schema.prisma'));

// Trick to include the right native binary
fs.readFileSync(
  path.join(
    __dirname,
    './generated/prisma/libquery_engine-rhel-openssl-3.0.x.so.node'
  )
);
