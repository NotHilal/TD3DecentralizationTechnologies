# **Data Redundancy and Distributed Computing Workshop**

## **Overview**
This workshop is divided into two main sections:
1. **Decentralized Prediction System**: Uses distributed computing and proof-of-stake consensus to refine predictions.
2. **E-commerce Redundancy**: Implements synchronous mirroring and asynchronous replication to ensure system reliability. These methods help maintain **high availability and fault tolerance** in a distributed setup.

---

## **Part A: Decentralized Prediction System**
### **Q1: Train Diverse Predictive Models**
- Trained a **KNN model** on the Iris dataset.
- Created a **Flask API** to serve predictions.
- API supports `GET /predict` and `POST /predict` requests.
- The model helps in classifying flower species based on input features, showcasing the power of distributed AI models.

### **Q2: Aggregated Consensus Predictions**
- Multiple nodes predict outcomes.
- Responses are averaged using a consensus model.
- This ensures that predictions are not biased by a single node but instead reflect an **aggregated decision** from multiple models.

### **Q3: Trust-Based Model Weighting**
- Nodes receive a **trust score (0-1)** based on past accuracy.
- Correct predictions **increase weight** and reliability.
- Incorrect predictions **reduce trust**, discouraging unreliable models.
- Trust scores evolve dynamically, ensuring fairness in prediction aggregation.

### **Q4: Proof-of-Stake with Slashing**
- Nodes **stake tokens** (e.g., 1000 tokens per model).
- Incorrect predictions **reduce stake**, penalizing inaccurate responses.
- Correct predictions **increase stake**, rewarding high-performance models.
- Trust and stake influence the final decision, ensuring that the most reliable nodes contribute the most to the final prediction.
- This mechanism mirrors **blockchain governance models**, ensuring **self-regulation** and **network integrity**.

---

## **Part B: E-commerce System with Redundancy**
### **Q1: Hello World Server**
- Simple **Express.js server** returning `Hello, World!` at `/`.
- Verifies that the development environment is correctly set up.

### **Q2: DNS Registry**
- Express server that registers services and returns `localhost:3001`.
- This allows distributed services to dynamically discover each other.

### **Q3: Database Setup**
- JSON-based database for **products, orders, and carts**.
- Alternative options: **MongoDB, PostgreSQL, MySQL** for scalability.
- A structured database ensures **data persistence** and **quick retrieval**.

### **Q4: E-commerce API Implementation**
- **Products**: CRUD operations enable adding, updating, and deleting items.
- **Orders**: Facilitates order placement and tracking.
- **Cart**: Enables users to manage their shopping cart.
- API follows **REST principles** for seamless communication.

### **Q5: Simple Frontend**
- `index.html` provides an interface to interact with the e-commerce API.
- `script.js` fetches product data from the backend.
- The frontend ensures ease of access and usability for end users.

### **Q6: Handling Server Failure**
- When the API crashes, **users lose access to services**.
- Solutions:
  - **Restart server manually or automatically.**
  - **Deploy multiple instances** for load balancing.
  - **Use PM2 for auto-restart and monitoring.**
  - Implement **failover strategies** to redirect users to alternative instances.

### **Q7: Synchronous Mirroring**
- **Real-time data replication** ensures data consistency.
- Primary and secondary databases stay **identical at all times**.
- If one database fails, the other takes over immediately with zero data loss.
- This guarantees **high availability and zero Recovery Point Objective (RPO).**

### **Q8: Asynchronous Replication**
- Writes go to **primary DB immediately**, ensuring fast performance.
- **Secondary DB updates later** with a small delay.
- **Faster response times** but risks minor data loss in case of failure.
- This is useful for scenarios where **low latency is prioritized over real-time consistency**.

---

## **Final Thoughts**
- **Decentralized Prediction System** ensures fairness with weighted trust and proof-of-stake incentives. This approach fosters self-governance and accurate AI models.
- **E-commerce Redundancy** prevents data loss and ensures availability, ensuring that business operations remain unaffected even in cases of system failure.
- **Resilient Systems**: Both projects showcase how redundancy and consensus mechanisms can be leveraged for **fault-tolerant, decentralized, and scalable applications**.
- Future improvements:
  - **Use real database replication** (e.g., MySQL, MongoDB replica sets) to handle larger datasets.
  - **Implement container orchestration** (e.g., Kubernetes) to scale services dynamically.
  - Enhance the **frontend UI/UX** for better user interaction.

This workshop demonstrates **resilient AI models and fail-safe e-commerce systems** by combining **decentralization principles with high-availability techniques**!
