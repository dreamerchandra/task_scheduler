#!/bin/bash
set -e

echo "Starting SAM build..."
sam build

cp -r sub/prisma .aws-sam/build/PublisherFunction/
cp -r sub/prisma .aws-sam/build/subFunction/

mkdir -p .aws-sam/build/subFunction/generated/
mkdir -p .aws-sam/build/PublisherFunction/generated/
cp -r sub/generated .aws-sam/build/subFunction/
cp -r sub/generated .aws-sam/build/PublisherFunction/

echo "Build and copy steps completed successfully."

sam deploy