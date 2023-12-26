# big-DataIndexing

# Project Name

## Overview

This project aims to create a robust Rest API for handling structured data in JSON format, leveraging various technologies such as Redis, Elastic Search, JWT token, Basic Auth, JavaScript, Node.js, JSON Validator, and RabbitMQ. The API evolves through three demos, each introducing additional features and complexity.

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
- Implements ReST API semantics.
  - Update if not changed.
  - Read if changed.

### Storage
- Uses Redis as a key/value store.
- Implements provided use case.

## Demo 2: Enhanced API

### Features
- Continues to handle structured data in JSON.
- Adds support for CRUD operations: MERGE/PATCH, DELETE.

### Validation
- Continues to use JSON schema for data model validation.
- Implements JSON validation using JSON Validator.

### Advanced Semantics
- Expands ReST API semantics.
  - Update if not changed.
  - Conditional read and write.

### Storage
- Continues to use Redis as a key/value store.
- Introduces JWT token for enhanced security.

## Demo 3: Advanced Features

### Features
- Maintains JSON data handling.
- Supports CRUD operations, including merge and cascaded delete.

### Validation
- Continues to use JSON schema for data model validation.
- Implements JSON validation using JSON Validator.

### Advanced Semantics
- Further expands ReST API semantics.
  - Update if not changed.

### Storage
- Continues to use Redis as a key/value store.
- Implements search functionality using Elastic Search.
- Supports join operations.
- Introduces parent-child indexing.

### Additional Features
- Implements RabbitMQ for queueing and improved performance.

### Security
- Maintains JWT token for secure communication.
- Implements Basic Auth for additional security.

## Getting Started

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Run the application: `npm start`.

