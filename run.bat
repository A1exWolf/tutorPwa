@echo off
echo Starting Tutor Application...

REM Check if Docker is installed
where docker >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Docker is not installed. Please install Docker and try again.
    exit /b 1
)

REM Check if Docker Compose is installed
where docker-compose >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Docker Compose is not installed. Please install Docker Compose and try again.
    exit /b 1
)

REM Build and start the services
echo Building and starting services...
docker-compose up -d --build

REM Wait for services to be healthy
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

REM Show status
echo Services started successfully!
echo You can access the application at: http://localhost
echo.
echo Running containers:
docker-compose ps

echo.
echo To view logs, run: docker-compose logs -f
echo To stop the application, run: docker-compose down

pause 