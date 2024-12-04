# Build stage
FROM node:16-alpine as build

# Set a build argument for environment type (default to 'development')
ARG BUILD_ENV=development
ENV NODE_ENV=$BUILD_ENV

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Build the app based on the environment
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY conf/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
