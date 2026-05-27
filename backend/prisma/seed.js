const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@haqms.com' },
    update: {},
    create: { email: 'admin@haqms.com', password: hashedPassword, name: 'Admin User', role: 'ADMIN' },
  });

  await prisma.user.upsert({
    where: { email: 'reception1@haqms.com' },
    update: {},
    create: { email: 'reception1@haqms.com', password: hashedPassword, name: 'Receptionist One', role: 'RECEPTIONIST' },
  });

  await prisma.user.upsert({
    where: { email: 'doctor1@haqms.com' },
    update: {},
    create: { email: 'doctor1@haqms.com', password: hashedPassword, name: 'Dr. John Smith', role: 'DOCTOR' },
  });

  const doctor1 = await prisma.doctor.upsert({
    where: { id: 'doc-001' },
    update: {},
    create: {
      id: 'doc-001',
      name: 'Dr. John Smith',
      specialization: 'Cardiology',
      department: 'Cardiology',
      consultationFee: 500,
      experience: 10,
      availableFrom: '09:00',
      availableTo: '17:00',
    },
  });

  const doctor2 = await prisma.doctor.upsert({
    where: { id: 'doc-002' },
    update: {},
    create: {
      id: 'doc-002',
      name: 'Dr. Sarah Johnson',
      specialization: 'Surgery',
      department: 'Surgery',
      consultationFee: 800,
      experience: 15,
      availableFrom: '08:00',
      availableTo: '16:00',
    },
  });

  const patient1 = await prisma.patient.upsert({
    where: { id: 'pat-001' },
    update: {},
    create: {
      id: 'pat-001',
      name: 'Clark Kent',
      email: 'clark@dailyplanet.com',
      phoneNumber: '9876543210',
      age: 35,
      gender: 'Male',
      medicalHistory: null,
    },
  });

  const patient2 = await prisma.patient.upsert({
    where: { id: 'pat-002' },
    update: {},
    create: {
      id: 'pat-002',
      name: 'Bruce Wayne',
      email: 'bruce@wayne.com',
      phoneNumber: '9123456789',
      age: 40,
      gender: 'Male',
      medicalHistory: null,
    },
  });

  const patient3 = await prisma.patient.upsert({
    where: { id: 'pat-003' },
    update: {},
    create: {
      id: 'pat-003',
      name: 'Diana Prince',
      email: 'diana@themyscira.com',
      phoneNumber: '9988776655',
      age: 30,
      gender: 'Female',
      medicalHistory: 'Allergic to penicillin',
    },
  });

  // Today's appointments so doctor dashboard shows them
  await prisma.appointment.upsert({
    where: { id: 'appt-001' },
    update: { appointmentDate: new Date('2026-05-27T10:00:00Z'), doctorId: doctor1.id },
    create: {
      id: 'appt-001',
      patientId: patient1.id,
      doctorId: doctor1.id,
      appointmentDate: new Date('2026-05-27T10:00:00Z'),
      reason: 'Routine checkup',
      status: 'PENDING',
    },
  });

  await prisma.appointment.upsert({
    where: { id: 'appt-002' },
    update: { appointmentDate: new Date('2026-05-27T11:00:00Z'), doctorId: doctor1.id },
    create: {
      id: 'appt-002',
      patientId: patient3.id,
      doctorId: doctor1.id,
      appointmentDate: new Date('2026-05-27T11:00:00Z'),
      reason: 'Follow-up',
      status: 'PENDING',
    },
  });

  await prisma.appointment.upsert({
    where: { id: 'appt-003' },
    update: {},
    create: {
      id: 'appt-003',
      patientId: patient2.id,
      doctorId: doctor1.id,
      appointmentDate: new Date('2026-05-27T12:00:00Z'),
      reason: 'Cardiac consultation',
      status: 'PENDING',
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });