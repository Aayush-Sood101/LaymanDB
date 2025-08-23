# LaymanDB

LaymanDB is a revolutionary database design platform that transforms natural language descriptions into professional database schemas. Bridging the gap between conceptual thinking and technical implementation, it empowers both developers and non-technical stakeholders to create sophisticated database designs without writing a single line of SQL.

By combining state-of-the-art natural language processing with interactive visualization tools, LaymanDB streamlines the database design process from initial concept to implementation-ready SQL and comprehensive documentation.

## Key Features

- **AI-Powered Input Refinement Loop**: Moving beyond simple "text-in, code-out" models, LaymanDB engages users in an interactive dialogue to improve their initial descriptions. The system analyzes your prompt, suggests improvements to clarify ambiguities, and normalizes your requirements—resulting in more accurate and comprehensive database designs. This human-computer collaboration creates better schemas than either could produce alone.

- **Textbook-Quality Visualization as a Core Feature**: Unlike tools that treat visualization as an afterthought, LaymanDB prioritizes the generation of high-fidelity, pedagogically sound ER diagrams using ReactFlow. These interactive visualizations serve both as a design interface and a learning tool, allowing real-time manipulation of entities and relationships while maintaining visual clarity that meets academic standards for entity-relationship modeling.

- **Integrated Multi-Dialect SQL Generation**: From a single natural language input, LaymanDB generates optimized SQL for multiple database systems (MySQL, PostgreSQL, SQLite, SQL Server). The platform intelligently handles dialect-specific syntax, data types, and performance optimizations—bridging the gap between conceptual design and practical implementation across different database environments.

- **Intelligent, Context-Aware Documentation**: Automatically create comprehensive markdown documentation that combines your original natural language intent with the final structured schema. This documentation includes detailed explanations of entities, relationships, design decisions, and embedded diagrams—closing the loop from requirements to design to documentation and ensuring stakeholders at all technical levels can understand the schema.

## Why LaymanDB?

### Bridging the Gap Between Concept and Implementation

- **Accessible to Non-Technical Stakeholders**: Business analysts, product managers, and domain experts can contribute directly to database design without deep technical knowledge.

- **Educational Value**: Perfect for students and educators, LaymanDB's visualizations and documentation serve as learning tools for database design principles.

- **Rapid Prototyping**: Quickly generate and iterate on database designs during early project phases, accelerating development timelines.

- **Cross-Team Collaboration**: Create a common language between business and technical teams with visualizations that both can understand.

- **Consistency Across Implementations**: Generate dialect-specific SQL while maintaining the same conceptual schema, ensuring consistency across different database implementations.

- **Living Documentation**: Documentation stays in sync with the schema design, eliminating the common problem of outdated documentation.

### What Sets LaymanDB Apart

- **Beyond Text-to-SQL Generation**: Unlike tools that simply convert text to SQL, LaymanDB offers a complete design workflow with refinement, visualization, and multi-format export.

- **Focused on Educational Quality**: The ER diagrams prioritize clarity and adhere to standard entity-relationship modeling conventions used in academic settings.

- **Human-AI Collaboration**: Instead of treating AI as a black box, LaymanDB creates a collaborative loop where human insight and AI capabilities enhance each other.

- **Cross-Dialect Support**: Generate SQL for multiple database systems from a single source of truth, eliminating the need for manual translation between dialects.

## Additional Features

- **Interactive ERD Visualization**: Visualize and edit database structures in real-time with drag-and-drop functionality
- **Smart Entity-Relationship Modeling**: Create entities, attributes, and relationships with automatic placement and organization
- **Mermaid ER Diagram Export**: Generate Mermaid syntax diagrams for embedding in documentation
- **Schema Versioning & History**: Track changes and maintain a complete history of your database designs

## Architecture

### Frontend

- Next.js 15.x with React 19.x for a modern, performant UI
- ReactFlow for sophisticated, interactive ERD visualization
- Context API for state management
- Tailwind CSS with custom UI components for responsive design
- Mermaid.js for diagram rendering in documentation
- Framer Motion for smooth animations and transitions

### Backend

- Node.js with Express for RESTful API endpoints
- MongoDB for schema storage and versioning
- OpenAI integration for natural language processing and schema generation
- Multi-dialect SQL generation (MySQL, PostgreSQL, SQLite, SQL Server)
- Winston for comprehensive error handling and logging
- Socket.io for real-time updates

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- MongoDB (local or remote instance)

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/Aayush-Sood101/LaymanDB.git
cd LaymanDB
```

#### 2. Install backend dependencies

```bash
cd backend
npm install
```

#### 3. Configure environment variables

Create a `.env` file in the backend directory:

```
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/laymandb
LOG_LEVEL=info
```

#### 4. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### Running the application

#### 1. Start the backend server

```bash
cd backend
npm run dev
```

#### 2. Start the frontend development server

```bash
cd frontend
npm run dev
```

#### 3. Open your browser

Navigate to `http://localhost:3000` to use the application.

## Usage

### Workflow: From Natural Language to Complete Database Design

1. **Describe Your Database**: Start by describing your database requirements in plain English. For example: "I need a system to manage an online bookstore with customers, orders, books, and authors. Books can have multiple authors, and customers can place multiple orders."

2. **Refine with AI Assistance**: LaymanDB analyzes your description and suggests improvements to clarify ambiguities or add missing details. This collaborative refinement process ensures your final schema will be comprehensive and accurate.

3. **Generate Schema**: Once your description is refined, LaymanDB processes it through advanced NLP models to identify entities, relationships, attributes, and constraints—creating a complete database schema.

4. **Visualize and Customize**: The generated schema appears as an interactive Entity-Relationship Diagram. Drag entities to reposition them, modify relationships, and fine-tune the design to meet your specific needs.

5. **Export and Implement**: When satisfied with your design, export it in multiple formats:
   - SQL scripts for your preferred database system (MySQL, PostgreSQL, SQLite, SQL Server)
   - Visual ER diagrams (SVG, PNG)
   - Mermaid syntax diagrams for embedding in documentation
   - Comprehensive markdown documentation that explains the schema design

6. **Save and Iterate**: Save your schema to revisit and modify it later as requirements evolve. LaymanDB maintains a version history of your designs for easy tracking of changes.

## Detailed Project Overview

### Entity-Relationship Diagram (ERD) Editor

The heart of LaymanDB is its powerful ERD editor, built with React Flow. This interactive canvas allows you to:

- **Create Entities**: Add tables with a simple click
- **Add Attributes**: Define columns with data types, constraints, and descriptions
- **Establish Relationships**: Connect entities with various relationship types (one-to-one, one-to-many, many-to-many)
- **Visual Feedback**: Receive immediate visual feedback on your database design
- **Automatic Layout**: Intelligently positions entities and attributes for optimal readability

### SQL Generation

LaymanDB translates your visual designs into production-ready SQL scripts:

- **Dialect Support**: Generate SQL for multiple database systems
- **Optimization**: Create optimized table structures with proper indexes and constraints
- **Foreign Key Management**: Automatically handle foreign key relationships
- **Customization**: Fine-tune the generated SQL to meet specific requirements

### ER Diagram Export

LaymanDB provides multiple options for exporting your database designs:

- **SVG Diagrams**: Export clean, vector-based diagrams for documentation
- **Mermaid Support**: Generate Mermaid syntax for embedding in Markdown files or documentation
- **Interactive Viewing**: Preview Mermaid diagrams directly in the application
- **Customization**: Adjust diagram appearance and layout for optimal presentation

### Schema Management

Keep track of your database designs with built-in versioning:

- **Version History**: Track changes to your schema over time
- **Session Management**: Save and resume work on multiple projects
- **Export Options**: Download your designs in various formats (SQL, Documentation, JSON)
- **Schema Validation**: Automatic validation ensures database integrity

## Detailed Setup and Running Guide

### 1. Clone and Set Up the Project Structure

1. Clone the repository (or create the project structure if you're building from scratch):
   ```bash
   git clone https://github.com/Aayush-Sood101/LaymanDB.git
   cd LaymanDB
   ```

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following content:
   ```
   PORT=4000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   MONGODB_URI=mongodb://localhost:27017/laymandb
   LOG_LEVEL=info
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_AI_API_KEY=your_google_ai_api_key
   ```

4. Install and start MongoDB (if not already installed):
   - **Windows**: 
     - Download and install from [MongoDB website](https://www.mongodb.com/try/download/community)
     - Create a data directory: `mkdir -p C:/data/db`
     - Start MongoDB: `"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath="C:/data/db"`
   
   - **macOS** (using Homebrew):
     ```bash
     brew tap mongodb/brew
     brew install mongodb-community
     brew services start mongodb-community
     ```

   - **Linux**:
     ```bash
     sudo apt update
     sudo apt install -y mongodb
     sudo systemctl start mongodb
     ```

5. Start the backend server:
   ```bash
   npm run dev
   ```
   This will start the server on http://localhost:4000

### 3. Frontend Setup

1. Open a new terminal window and navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   This will start the Next.js development server on http://localhost:3000

### 4. Using the Application

1. Open your browser and navigate to http://localhost:3000
2. You should see the LaymanDB interface with the ERD design canvas
3. Create your database schema:
   - Add entities using the toolbar
   - Add attributes to entities
   - Define relationships between entities
4. Explore the generated ERD diagram, export SQL scripts, and view documentation

### 5. Common Issues and Solutions

1. **MongoDB Connection Error**:
   - Ensure MongoDB is running
   - Check your MONGODB_URI in the .env file
   - Run `mongod` manually to start the MongoDB server

2. **Port Already in Use**:
   - Change the PORT in the .env file
   - Kill the process using the port: `npx kill-port 4000` (for backend) or `npx kill-port 3000` (for frontend)

3. **Missing Dependencies**:
   - Run `npm install` in both frontend and backend directories
   - Check for errors in the console and install any missing packages

4. **React Flow Rendering Issues**:
   - Ensure you have the correct CSS imports
   - Check browser console for any JavaScript errors
   - Try clearing your browser cache

## Technical Implementation Details

### Frontend Components

- **ERD Diagram**: Core visualization component built on React Flow
  - `ERDDiagram.js`: Main component that manages the diagram canvas
  - `EntityNode.js`: Custom node for database tables/entities
  - `AttributeNode.js`: Custom node for columns/attributes
  - `RelationshipNode.js`: Custom node for representing relationships
  - `ERDEdge.js`: Custom edge component for connecting nodes

- **User Interface**:
  - `ExportDialog.js`: Modal for exporting schema to SQL/documentation
  - `SchemaVisualization.js`: Container for the ERD diagram
  - `SessionHistory.js`: Component for tracking schema versions
  - `PromptInputPanel.js`: Natural language input interface with refinement capabilities

### Backend Architecture

- **API Routes**:
  - `/api/schema`: CRUD operations for database schemas
  - `/api/session`: Manage user sessions and schema history
  - `/api/export`: Export schemas to various formats

- **Core Services**:
  - `schemaGenerator.service.js`: Create and manage database schema objects
  - `sqlGenerator.service.js`: Convert schema to SQL for different dialects
  - `documentation.service.js`: Generate human-readable documentation
  - `nlp.service.js`: Natural language processing for schema generation
  - `mermaidGenerator.service.js`: Generate Mermaid syntax diagrams

- **Database Models**:
  - `schema.model.js`: Mongoose model for database schemas
  - `session.model.js`: Track user sessions and schema history

### Core Features Implementation

1. **AI-Powered Input Refinement Loop**:
   - Intelligent prompt optimization through `nlp.service.js`
   - Two-step process: initial input analysis and suggested improvements
   - Natural language processing to identify key database concepts
   - Real-time feedback loop for prompt refinement before schema generation
   - Helps users clarify their requirements and produce more accurate schemas
   - User interface for accepting or modifying AI suggestions

2. **Textbook-Quality Visualization**:
   - High-fidelity Entity-Relationship diagrams using ReactFlow
   - Custom entity and relationship node components that prioritize readability
   - Interactive diagram manipulation with real-time updates
   - Customizable visual themes (light/dark mode) for optimal presentation
   - Automatic node positioning with manual override capabilities
   - Zoom, pan, and focus controls for exploring complex schemas
   - Visual indicators for relationship types and cardinality constraints

3. **Integrated Multi-Dialect SQL Generation**:
   - Unified schema representation translated to multiple SQL dialects
   - Dialect-specific generators in the `dialects/` directory
   - Support for MySQL, PostgreSQL, SQLite, and SQL Server from a single source model
   - Handling of dialect-specific data types and syntactic variations
   - Optimized SQL output with proper indexes, constraints, and foreign keys
   - SQL formatting for readability and compatibility

4. **Intelligent, Context-Aware Documentation**:
   - Automatic markdown documentation generation
   - Incorporation of original natural language intent in documentation
   - Detailed explanations of entities, attributes, and relationships
   - Context-aware descriptions that explain design decisions
   - Integration of schema diagrams (Mermaid syntax) within documentation
   - Complete end-to-end traceability from requirements to implementation

5. **Interactive ERD Editor**:
   - Drag-and-drop interface for entity and attribute positioning
   - Real-time updates as elements are modified
   - Smart relationship routing to avoid diagram clutter
   - Dynamic visualization of changes to schema structure
   - Support for different relationship types (1:1, 1:N, N:M)
   - Cardinality constraint visualization
   - Attribute inheritance and propagation

## License

This project is licensed under the MIT License - see the LICENSE file for details.
