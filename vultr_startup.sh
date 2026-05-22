#!/bin/bash

# --- CONFIGURATION (UPDATE THESE) ---
# Example: GIT_REPO_URL="https://github.com/yourusername/kora.git"
GIT_REPO_URL="YOUR_GITHUB_REPO_URL_HERE"
DB_NAME="kickoff_db"
DB_USER="kora_admin"
DB_PASS=$(openssl rand -hex 12) # Generates a random secure password
APP_DIR="/var/www/kora"

# --- SYSTEM UPDATES ---
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get upgrade -y

# --- INSTALL DEPENDENCIES ---
# Nginx, MySQL, PHP 8.1, Go, Git, and Java (for Mobile)
apt-get install -y nginx mysql-server php8.1-fpm php8.1-mysql php8.1-curl php8.1-json php8.1-mbstring golang-go git curl openjdk-11-jdk

# --- INSTALL NODE.JS (v22) ---
# Node.js v22 is required for OpenClaw
echo "Installing Node.js v22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# --- INSTALL OPENCLAW ---
echo "Installing OpenClaw AI Framework..."
curl -fsSL https://openclaw.ai/install.sh | bash

# --- GLOBAL NPM TOOLS ---
npm install -g react-native-cli

# --- DATABASE SETUP ---
mysql -e "CREATE DATABASE ${DB_NAME};"
mysql -e "CREATE USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';"
mysql -e "GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# --- PROJECT DEPLOYMENT ---
mkdir -p $APP_DIR
# Note: If the repo is private, you will need to manually clone it after login 
# or use a Personal Access Token in the URL: https://TOKEN@github.com/...
git clone $GIT_REPO_URL $APP_DIR

# Import the schema (assuming kickoff_db.sql is in the root)
if [ -f "$APP_DIR/kickoff_db.sql" ]; then
    mysql $DB_NAME < "$APP_DIR/kickoff_db.sql"
fi

# --- MOBILE SETUP ---
if [ -d "$APP_DIR/mobile" ]; then
    echo "Installing mobile dependencies..."
    cd $APP_DIR/mobile
    npm install
fi

# --- CONFIGURE ENV FILE ---
# Create the .env file for the backend
cat <<EOF > $APP_DIR/backend/.env
DB_HOST=localhost
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASS=${DB_PASS}
APP_ENV=production
CORS_ALLOWED_ORIGIN=*
JWT_SECRET=$(openssl rand -hex 32)
EOF

# --- PERMISSIONS ---
# Allow Nginx/PHP to write to the ratelimit folder
chown -R www-data:www-data $APP_DIR/backend/tmp
chmod -R 775 $APP_DIR/backend/tmp

# --- NGINX CONFIGURATION ---
cat <<EOF > /etc/nginx/sites-available/kora
server {
    listen 80;
    server_name _; # Change this to your domain later
    root $APP_DIR/backend;
    index index.php;

    location / {
        try_files \$uri \$uri/ /api/v1/health.php;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    }

    location ~ /\.ht {
        deny all;
    }
}
EOF

ln -s /etc/nginx/sites-available/kora /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
systemctl restart nginx

# --- GO PROXY SETUP (Background Service) ---
if [ -d "$APP_DIR/backend/proxy" ]; then
    cd $APP_DIR/backend/proxy
    go build -o kora-proxy main.go
    
    # Create systemd service to keep the proxy running
    cat <<EOF > /etc/systemd/system/kora-proxy.service
[Unit]
Description=Kora Go Proxy Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$APP_DIR/backend/proxy
ExecStart=$APP_DIR/backend/proxy/kora-proxy
Restart=always

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable kora-proxy
    systemctl start kora-proxy
fi

# --- SUMMARY LOG ---
echo "------------------------------------------------"
echo "Kora Deployment Complete!"
echo "Database: ${DB_NAME}"
echo "User: ${DB_USER}"
echo "Password: ${DB_PASS}"
echo "Location: ${APP_DIR}"
echo "------------------------------------------------" > /root/install_summary.txt

cat /root/install_summary.txt
