# Tutor App Deployment

This is a guide for deploying the Tutor App using Docker Compose.

## Prerequisites

- Docker and Docker Compose installed on your server
- Git installed (to clone the repository)

## Deployment Steps

1. Clone the repository:

   ```
   git clone <repository-url>
   cd tutor
   ```

2. Start the application with Docker Compose:

   ```
   docker-compose up -d
   ```

   This single command will:

   - Create a PostgreSQL database
   - Build and start the backend NestJS application
   - Apply Prisma migrations to the database
   - Build and start the frontend Vue application
   - Configure Nginx to route traffic between frontend and backend

3. The application should now be accessible at:
   ```
   http://your-server-ip
   ```

## Service URLs

- Frontend: http://your-server-ip
- Backend API: http://your-server-ip/api
- Database: PostgreSQL running on port 5432 (internal to Docker network)

## Useful Commands

- View running containers:

  ```
  docker-compose ps
  ```

- View logs from all services:

  ```
  docker-compose logs
  ```

- View logs from a specific service:

  ```
  docker-compose logs backend
  docker-compose logs frontend
  docker-compose logs nginx
  docker-compose logs postgres
  ```

- Stop all services:

  ```
  docker-compose down
  ```

- Stop all services and remove volumes (will delete database data):

  ```
  docker-compose down -v
  ```

- Rebuild and restart services:
  ```
  docker-compose up -d --build
  ```

## Troubleshooting

- If the application is not accessible, check the logs for errors:

  ```
  docker-compose logs
  ```

- Ensure all containers are running:

  ```
  docker-compose ps
  ```

- Check Nginx configuration:

  ```
  docker-compose exec nginx nginx -t
  ```

- Check database connection:
  ```
  docker-compose exec postgres psql -U postgres -d tutor_pwa
  ```
