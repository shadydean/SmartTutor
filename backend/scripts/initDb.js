require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Service = require('../models/Service');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smarttutor';

const services = [
  {
    title: 'One-on-One Tutoring',
    description: 'Personalized tutoring sessions tailored to your needs',
    category: '1-on-1 Mentoring',
    price: 50,
    duration: 60,
    subjects: ['Mathematics', 'Physics']
  },
  {
    title: 'Group Study Session',
    description: 'Learn collaboratively with other students',
    category: 'Study Groups',
    price: 30,
    duration: 90,
    subjects: ['Chemistry', 'Biology']
  },
  {
    title: 'Exam Preparation',
    description: 'Focused preparation for upcoming exams',
    category: 'Exam Preparation',
    price: 60,
    duration: 120,
    subjects: ['Literature', 'History']
  }
];

const tutors = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@example.com',
    password: 'password123',
    role: 'tutor',
    subjects: ['Mathematics', 'Physics'],
    experience: '8 years',
    rating: 4.9
  },
  {
    name: 'Prof. Michael Chen',
    email: 'michael.chen@example.com',
    password: 'password123',
    role: 'tutor',
    subjects: ['Chemistry', 'Biology'],
    experience: '10 years',
    rating: 4.8
  },
  {
    name: 'Dr. Emily Brown',
    email: 'emily.brown@example.com',
    password: 'password123',
    role: 'tutor',
    subjects: ['Literature', 'History'],
    experience: '6 years',
    rating: 4.7
  }
];

async function initializeDb() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({ role: 'tutor' });
    await Service.deleteMany({});
    console.log('Cleared existing tutors and services');

    // Create tutors
    const createdTutors = [];
    for (const tutorData of tutors) {
      const hashedPassword = await bcrypt.hash(tutorData.password, 10);
      const tutor = await User.create({
        ...tutorData,
        password: hashedPassword
      });
      createdTutors.push(tutor);
      console.log(`Created tutor: ${tutor.name}`);
    }

    // Create services and assign tutors
    for (let i = 0; i < services.length; i++) {
      const service = await Service.create({
        ...services[i],
        tutors: [createdTutors[i]._id], // Assign corresponding tutor
        isActive: true
      });
      console.log(`Created service: ${service.title}`);
    }

    console.log('Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDb();
