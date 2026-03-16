# Build stage
FROM node:22-alpine as build-stage

# Use Aliyun mirror for Alpine
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with Taobao mirror
RUN npm install --registry=https://registry.npmmirror.com

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:stable-alpine as production-stage

# Copy built assets from build-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
