# Stage 1: Build Angular app
FROM node:18 AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

# Stage 2: Serve Angular app with Nginx

# Use official Nginx image
FROM nginx:latest 

# Remove default Nginx config
RUN rm /etc/nginx/conf.d/default.conf 

# Copy our custom Nginx config
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular app to Nginx HTML directory
COPY --from=build /app/dist/ipl-prediction-ui /usr/share/nginx/html 

# Expose port 80 for Railway
EXPOSE 80 

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

