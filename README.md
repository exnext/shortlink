# ShortLink

ShortLink is a simple service to make tiny url. It is excellent solution in internal network.
It works based main on [expressjs](https://www.npmjs.com/package/expressjs) and [sequelize](https://www.npmjs.com/package/sequelize) modules with [sqlite3](https://www.npmjs.com/package/sqlite3).

## Startup

```sh
git clone https://github.com/exnext/shortlink.git
cd shortlink
npm install

npm start
#or
node shortlink.js
```

## User inrerface

You can build own web page to use the shortlink service or can use added example. Our example has based on VUE framework. Change our logo for your and have fun from full functionality service.

On web browser set url address served by the shortlink (e.g http://localhost:8080). Shortlink service should redirect you to path **/add**.

<p align="center">
    <img src="./image/enter.png">
</p>

<p align="center">
    <img src="./image/result.png">
</p>

## Default configuration

Default values are defined in shortlink.js. Each value can be overridden by config.json file.

```js
{
    port: 8080,
    address: "localhost",
    database: "./shortlink.db"
}
```

## Custom configuration

You can override part or all default values (e.g change port or database). You must create file config.json contains overrides values.

```json
{
    "port": 8001,
    "address": "0.0.0.0",
    "database": "./file.db"
}
```

```json
{
    "port": 8002,
    "database": ":memory:"
}
```

## reCAPTCHA v2

The service supports reCAPTCHA. You must set fields into config.json to enable feature. The solution has used [recaptcha-verify](https://www.npmjs.com/package/recaptcha-verify) module.

```json
{
    "recaptcha": {
        "siteKey": "YOUR SITE KEY",
        "secretKey": "YOUR SECRET KEY"
    }
}
```

## Linux configuration

Below are examples to configurations for apache and linux service

### Apache

```apache
<VirtualHost *:80>
    ServerName shortlink.YOUR-DOMAIN.pl
    ProxyPass / http://localhost:8080/
    ProxyPassReverse / http://localhost:8080/
    ProxyPreserveHost On
    ProxyRequests Off
</VirtualHost>
```

### Service

Save configuration from below example to /lib/systemd/system/shortlink.service...

```ini
[Unit]
Description=LTPS NodeJS Test Application
After=network-online.target

[Service]
Restart=on-failure
WorkingDirectory=/ANY-PATH/shortlink/
ExecStart=/usr/bin/node /ANY-PATH/shortlink/shortlink.js

[Install]
WantedBy=multi-user.target
```

...and next execute commands

```sh
systemctl daemon-reload
systemctl enable shortlink
systemctl restart shortlink
```

## Demo

Here is [Live demo](https://sl.exnext.pl/add/) with restrictions. Project from github works with full functionality.
