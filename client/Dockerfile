# Serve React App with Nginx (very lightweight, ~30-40MB)
FROM mirror.gcr.io/library/nginx:stable-alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy pre-compiled build files from the host's dist folder
COPY dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
