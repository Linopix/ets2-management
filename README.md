# ETS2 Management System

A self-hosted Euro Truck Simulator 2 management web app with:

- Fahrtenbuch
- Fuhrparkverwaltung
- Fahrer-Management
- Garagenverwaltung
- Secret Roads Tracker
- Karten-Erkundung
- JSON Export / Import
- Docker support

## Disclaimer

This project was created mostly with the help of AI tools.

I am not a professional developer and mainly built this project for personal use and learning purposes.  
The code may contain inefficient solutions, bad practices or security issues I am not aware of.

Use at your own risk.

That said, the application is functional and works well enough for my own ETS2 setup.

## Features

- User accounts with JWT authentication
- SQLite database
- Persistent Docker storage
- REST API backend
- Single-file frontend
- Docker Compose support
- Raspberry Pi compatible

## Installation

```bash
git clone https://github.com/linopix/ets2-management.git

cd ets2-management
bash install.sh
```

## Manual Installation

```bash
git clone https://github.com/linopix/ets2-management.git

cd ets2-management

cp backend/.env.example backend/.env

docker compose pull
docker compose up -d
```

Open:

```text
http://localhost:2006
```

## Update-Script

```bash
bash update.sh
```


## Manual Update

```bash
docker compose down
docker compose pull
docker compose up -d
```

## Backup

Database is stored inside:

```text
./data
```

## Security Notice

This project is mainly intended for local/home network usage.

If you expose it to the internet:
- use HTTPS
- use a reverse proxy
- use strong passwords
- understand the risks

## License

MIT