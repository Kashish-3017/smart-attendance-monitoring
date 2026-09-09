# Multi-stage Dockerfile for Smart Attendance Monitoring System

# Stage 1: Build JAR using Maven
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Runtime Container
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/smart-attendance-monitoring-1.0.0.jar app.jar

EXPOSE 8080
ENV PORT=8080

ENTRYPOINT ["java", "-jar", "app.jar"]
