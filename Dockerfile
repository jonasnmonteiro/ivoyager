FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html/dist
COPY --from=builder /app/src/styles /usr/share/nginx/html/styles
COPY --from=builder /app/assets /usr/share/nginx/html/assets
COPY --from=builder /app/index.html /usr/share/nginx/html/index.html
COPY --from=builder /app/manifest.json /usr/share/nginx/html/manifest.json
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
