# Sample Database Schema Examples

These example database requirements can be used to test the LaymanDB application. Use these as starting points to create your database schemas.

## 1. Basic E-commerce Database

```
Create a database for an e-commerce platform with products, categories, customers, and orders.
Products have attributes like name, price, description, and inventory count.
Products belong to multiple categories.
Customers can place multiple orders.
Each order contains multiple products with quantities.
Orders have status, date, and payment information.
```

## 2. Blog/Content Management System

```
Design a schema for a blog platform where users can write and publish articles.
Articles have a title, content, publication date, and status (draft or published).
Users can have roles (admin, editor, author, reader).
Articles can have multiple tags and belong to categories.
Readers can leave comments on articles.
Track article view counts and user engagement metrics.
```

## 3. Hospital Management System

```
Create a database for a hospital with departments, doctors, patients, and appointments.
Doctors belong to specific departments and have specializations.
Patients can have multiple medical records, prescriptions, and appointments.
Each appointment links a patient with a doctor at a specific time and date.
Prescriptions include medications with dosage instructions.
Medical records include diagnoses, treatments, and test results.
```

## 4. School/University Management System

```
Design a database for a university with students, professors, courses, and departments.
Students enroll in multiple courses each semester.
Professors belong to departments and teach specific courses.
Each course has a schedule, location, and credit hours.
Track student attendance, assignments, and grades.
Departments offer specific degree programs with required courses.
```

## 5. Inventory/Warehouse Management System

```
Create a database for inventory management across multiple warehouses.
Products have categories, suppliers, cost, and selling prices.
Track product quantities across different warehouse locations.
Record inventory movements (receipts, transfers, adjustments, sales).
Suppliers provide multiple products with varying lead times and minimum order quantities.
Include purchase orders with status tracking from order to delivery.
```

## 6. Real Estate Management System

```
Design a database for a real estate agency with properties, agents, clients, and transactions.
Properties have details like address, size, price, features, and status (available, sold, rented).
Agents manage property listings and client relationships.
Clients can be buyers, sellers, renters, or landlords.
Track property viewings, offers, and sales/rental transactions.
Include property maintenance requests and scheduled inspections.
```

## 7. Library Management System

```
Create a database for a library with books, members, borrowing, and reservations.
Books have authors, publishers, genres, ISBN, and multiple copies.
Members can borrow multiple books with due dates and return tracking.
Allow members to place reservations on currently borrowed books.
Track late returns and calculate fines.
Include librarians who process book transactions and manage inventory.
```

## 8. Project Management System

```
Design a schema for project management with teams, projects, tasks, and time tracking.
Projects have deadlines, budgets, and assigned team members.
Tasks belong to projects and can have dependencies on other tasks.
Team members log time spent on specific tasks.
Track project status, milestone completion, and resource allocation.
Include client information and project documentation.
```

## 9. Social Network Database

```
Create a database for a social network with users, posts, comments, and relationships.
Users have profiles with personal information and privacy settings.
Users can follow/friend other users forming a social graph.
Posts can include text, media, tags, and location data.
Users can comment on and like posts.
Track user activity, notifications, and message conversations.
```

## 10. Event Management System

```
Design a schema for managing events with venues, attendees, tickets, and speakers.
Events have details like name, date, time, location, and capacity.
Attendees can register for events and purchase different ticket types.
Speakers present at specific sessions within events.
Track event attendance, feedback, and ratings.
Include sponsorships, promotional codes, and financial transactions.
```

## 11. Financial Management System

```
Create a database for a financial management system with accounts, transactions, and budgets.
Accounts have types (checking, savings, credit card, investment), balances, and institutions.
Transactions include date, amount, category, payee/payer, and account.
Categories are hierarchical (e.g., Food > Dining Out > Restaurants).
Budgets are set for specific categories with monthly or annual limits.
Generate reports for income, expenses, and budget performance over time periods.
Track investments, returns, and portfolio allocation.
```

## 12. Hotel Reservation System

```
Design a database for a hotel chain with properties, rooms, guests, and reservations.
Hotels have locations, amenities, ratings, and multiple room types.
Rooms have types, rates, capacities, and availability status.
Guests can make reservations for specific dates with check-in/check-out times.
Track room service orders, special requests, and additional charges.
Include loyalty program with points, tiers, and rewards.
Manage staff assignments, shifts, and responsibilities.
```

## 13. Human Resources Management System

```
Create a schema for an HR system with employees, departments, positions, and payroll.
Employees have personal details, employment history, skills, and performance reviews.
Departments have budgets, managers, and hierarchical structures.
Positions include job descriptions, salary ranges, and required qualifications.
Track time off, attendance, and work schedules.
Manage recruitment process with job postings, applicants, and interview scheduling.
Include training programs, certifications, and career development paths.
```

## 14. Supply Chain Management System

```
Design a database for managing a supply chain with suppliers, manufacturing, and distribution.
Suppliers provide raw materials with pricing, lead times, and quality metrics.
Manufacturing processes transform materials into products with BOM (Bill of Materials).
Track production batches, quality control tests, and yields.
Warehouses store finished products with inventory levels and locations.
Distribution centers fulfill orders to retailers or customers.
Monitor logistics with shipping methods, carriers, routes, and delivery times.
Include demand forecasting, inventory optimization, and procurement planning.
```

## 15. Fitness Center Management System

```
Create a schema for a fitness center with members, classes, trainers, and equipment.
Members have membership types, billing information, and attendance history.
Classes have schedules, capacity limits, required skill levels, and assigned trainers.
Trainers have specializations, certifications, and availability schedules.
Equipment has maintenance schedules, usage tracking, and replacement history.
Track member fitness assessments, goals, and progress measurements.
Include nutrition plans, workout routines, and personal training sessions.
Manage facility areas, room bookings, and capacity monitoring.
```

## 16. Music Streaming Service Database

```
Design a database for a music streaming service with artists, albums, songs, and users.
Artists have profiles, genres, and can belong to bands or perform solo.
Albums contain multiple songs with release dates, cover art, and record labels.
Songs have durations, lyrics, composers, and audio file references.
Users have subscription plans, playlists, listening history, and preferences.
Track play counts, likes, user-generated playlists, and song recommendations.
Include music licensing, royalty calculations, and revenue distribution.
Manage podcast content with episodes, series, and subscriber metrics.
```

## 17. Insurance Management System

```
Create a schema for an insurance company with policies, customers, claims, and agents.
Policies have types (auto, home, life, health), coverage details, premiums, and terms.
Customers can have multiple policies, beneficiaries, and payment methods.
Claims include incident details, damage assessments, documentation, and payment status.
Agents manage customer relationships, policy sales, and commission structures.
Track risk assessments, underwriting decisions, and policy renewals.
Include third-party providers like repair shops, healthcare providers, and adjusters.
Generate reports on claims ratios, policy performance, and customer retention.
```

## 18. Restaurant Management System

```
Design a database for restaurant operations with menus, orders, inventory, and staff.
Menu items have categories, ingredients, prices, preparation times, and nutritional info.
Orders include table numbers, servers, items ordered, modifications, and payment details.
Inventory tracks ingredients, suppliers, costs, stock levels, and usage rates.
Staff have roles, schedules, performance metrics, and payroll information.
Manage reservations with dates, times, party sizes, and special requests.
Track customer preferences, loyalty programs, and feedback.
Include kitchen workflows, ticket times, and food waste monitoring.
```

## 19. Airline Reservation System

```
Create a schema for an airline with flights, passengers, aircraft, and bookings.
Flights have origins, destinations, schedules, gates, and status information.
Aircraft have models, seating configurations, maintenance records, and availability.
Passengers have profiles, travel documents, frequent flyer status, and preferences.
Bookings include flight selections, passenger information, seat assignments, and fares.
Track check-ins, baggage, boarding passes, and flight changes.
Manage crew assignments, duty hours, qualifications, and schedules.
Include partner airlines, codeshare flights, and alliance relationships.
```

## 20. Healthcare Information System

```
Design a database for healthcare management with patients, practitioners, treatments, and billing.
Patients have demographics, medical history, insurance information, and consent records.
Practitioners include doctors, nurses, specialists with credentials, departments, and availability.
Medical records track diagnoses, procedures, medications, allergies, and test results.
Appointments have scheduling, check-in/out times, and visit purposes.
Manage billing with insurance claims, payments, and patient statements.
Track inventory of medical supplies, pharmaceuticals, and equipment.
Include research studies, clinical trials, and anonymized data repositories.
```
