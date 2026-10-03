const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// Frontend files ko serve karne ke liye
app.use(express.static(__dirname));

// 1. MongoDB Connect
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Atlas Connected"))
.catch(err => console.log("❌ Mongo Error:", err.message));

// 2. Schema - Tumhari HTML ke hisab se
const bookingSchema = new mongoose.Schema({
  ticketId: String,
  passengerName: String,
  phone: String,
  cnic: String,
  email: String,
  paymentMethod: String,
  bus: Object,
  seats: Array,
  total: Number,
  createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);

// 3. Routes
app.get('/api', (req, res) => res.send("Malik Bus Backend Running + Atlas Connected"));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// POST - Ticket Save
app.post('/api/bookings', async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    console.log("✅ Ticket Saved:", newBooking.ticketId);
    res.json({ success: true, message: "Saved in Atlas!", data: newBooking });
  } catch (err) {
    console.log("❌ Save Error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET - History
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Backend Running on ${PORT}`));

module.exports = app;