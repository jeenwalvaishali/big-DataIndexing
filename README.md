# REST-API-In-Java-Spring-Boot

## Overview

This project implements a robust Rest API for handling structured data in JSON format, leveraging technologies such as Java, Spring Boot, Redis, Elastic Search, Kafka, Zookeeper, and Kibana. The API evolves through three demos, each introducing additional features and complexity.

## Demo 1: Basic API

### Features
- Handles structured data in JSON.
- Supports CRUD operations: POST, GET, DELETE.
- Implements Create (POST), Read (GET), and Delete (DELETE) operations.

### URI Specification
- Defines URIs for each operation.
- Specifies status codes and required headers.

### Data Model
- Defines a JSON schema for the data model.

### Advanced Semantics
- Implements ReST API semantics:
  - Update if not changed.
  - Read if changed.

### Storage
- Uses Redis as a key/value store for efficient data management.
- Implements provided use case.

## Demo 2: Enhanced API

### Features
- Continues to handle structured data in JSON.
- Adds support for additional CRUD operations: MERGE/PATCH and DELETE.

### Validation
- Continues to use JSON schema for data model validation.
- Implements JSON validation using built-in Spring Boot validation tools.

### Advanced Semantics
- Expands ReST API semantics:
  - Update if not changed.
  - Conditional read and write.

### Storage
- Continues to use Redis as a key/value store.
- Introduces Kafka for event-driven processing and enhanced performance.

## Demo 3: Advanced Features

### Features
- Maintains JSON data handling.
- Supports CRUD operations, including merge and cascaded delete.

### Validation
- Continues to use JSON schema for data model validation.
- Implements JSON validation using Spring Boot.

### Advanced Semantics
- Further expands ReST API semantics:
- Update if not changed.

### Storage and Indexing
- Continues to use Redis as a key/value store.
- Implements advanced search functionality using Elastic Search.
- Supports parent-child indexing and join operations.

### Additional Features
- Integrates Kafka for queueing and real-time event streaming.
- Uses Zookeeper for managing Kafka clusters.

### Monitoring and Visualization
- Utilizes Kibana for monitoring and visualizing Elastic Search data.

### Security
- Implements authentication and authorization mechanisms.
- Integrates Basic Auth for additional security.

## Getting Started

1. Clone the repository.
2. Set up required dependencies:
   - Install Redis.
   - Install Elastic Search and Kibana.
   - Set up Kafka and Zookeeper.
3. Run the application:
   - Start Redis, Kafka, Zookeeper, and Elastic Search.
   - Build and run the Spring Boot application using `mvn spring-boot:run`.

