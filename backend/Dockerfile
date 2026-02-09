FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
# Nota: O arquivo firebase-service-account.json deve ser fornecido via volume ou secret
ENTRYPOINT ["java", "-jar", "app.jar"]
