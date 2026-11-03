FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV REACT_APP_API_URL=/api
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/build /usr/share/nginx/html
