require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const elderlyRoutes = require('./src/routes/elderly.routes');
const taskRoutes = require('./src/routes/task.routes');
const assignmentRoutes = require('./src/routes/assignment.routes');
const categoryRoutes = require('./src/routes/category.routes');
const homeRoutes = require('./src/routes/home.routes');
const networkRoutes = require('./src/routes/network.routes');
const locationRoutes = require('./src/routes/location.routes');
const postalCodeRoutes = require('./src/routes/postalCode.routes');
const verificationRoutes = require('./src/routes/verification.routes');
const availabilityRoutes = require('./src/routes/availability.routes');
const familyMapRoutes = require('./src/routes/familyMap.routes');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/elderly', elderlyRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/homes', homeRoutes);
app.use('/api/networks', networkRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/postal-codes', postalCodeRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/family-map', familyMapRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CareCircle API is running', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 CareCircle server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
