#!/bin/bash

# Fix Nginx configuration issues
echo "Increasing server_names_hash_bucket_size and types_hash_max_size in Nginx configuration..."

# Update Nginx configuration
sudo sed -i '/http {/a \ \ \ \ types_hash_max_size 2048;\n\ \ \ \ server_names_hash_bucket_size 128;' /etc/nginx/nginx.conf

# Test the Nginx configuration
sudo nginx -t

if [ $? -eq 0 ]; then
  echo "Nginx configuration is valid."
  # Restart Nginx to apply the changes
  sudo systemctl restart nginx
else
  echo "Nginx configuration test failed. Please check /var/log/nginx/error.log for details."
  exit 1
fi

# Install or renew SSL certificate using Certbot
echo "Attempting to install SSL certificate using Certbot..."

sudo certbot install --cert-name thisistheapp-env.eba-e4mhqj2t.us-east-1.elasticbeanstalk.com

# Check if the certificate was installed successfully
if [ $? -eq 0 ]; then
  echo "SSL certificate installed successfully."
else
  echo "SSL certificate installation failed. Please check /var/log/letsencrypt/letsencrypt.log for details."
  exit 1
fi

# Optionally, restart Nginx after SSL installation
echo "Restarting Nginx to apply SSL changes..."
sudo systemctl restart nginx
