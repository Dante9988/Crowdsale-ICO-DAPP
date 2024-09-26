FROM node:20.15.1

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY hardhat.config.cjs ./

EXPOSE 8545

CMD ["npx", "hardhat", "node", "--network", "hardhat", "--hostname", "0.0.0.0", "--port", "8545"]
