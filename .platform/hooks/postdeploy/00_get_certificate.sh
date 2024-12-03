#!/bin/bash

# Adjust Nginx settings
NGINX_CONF="/etc/nginx/nginx.conf"

# Add custom settings if not already present
if ! grep -q "types_hash_max_size" $NGINX_CONF; then
    echo "Adding types_hash_max_size to Nginx config..."
    sed -i '/http {/a \    types_hash_max_size 2048;' $NGINX_CONF
fi

if ! grep -q "types_hash_bucket_size" $NGINX_CONF; then
    echo "Adding types_hash_bucket_size to Nginx config..."
    sed -i '/http {/a \    types_hash_bucket_size 128;' $NGINX_CONF
fi

if ! grep -q "server_names_hash_bucket_size" $NGINX_CONF; then
    echo "Adding server_names_hash_bucket_size to Nginx config..."
    sed -i '/http {/a \    server_names_hash_bucket_size 128;' $NGINX_CONF
fi

# Restart Nginx
nginx -t && service nginx restart

# Deploy the certificate
certbot --nginx -d thisistheapp-env.eba-e4mhqj2t.us-east-1.elasticbeanstalk.com -d group47intex.is404.net

