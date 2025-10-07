// src/seedPrograms.js
import { db } from './firebase'
import { collection, addDoc } from 'firebase/firestore'

const programs = [
  { title: "Social Futsal", type: "soccer", days: ["Tue","Thu"], address: "123 Smith St, Fitzroy VIC", suburb: "Fitzroy", lat: -37.799, lng: 144.983, capacity: 20, active: true },
  { title: "Community Yoga", type: "yoga", days: ["Mon","Wed"], address: "45 Brunswick St, Fitzroy VIC", suburb: "Fitzroy", lat: -37.804, lng: 144.978, capacity: 25, active: true },
  { title: "Women's Netball League", type: "netball", days: ["Tue","Fri"], address: "12 High St, Preston VIC", suburb: "Preston", lat: -37.742, lng: 145.003, capacity: 18, active: true },
  { title: "Youth Basketball Clinic", type: "basketball", days: ["Sat"], address: "8 Collins St, Melbourne VIC", suburb: "Melbourne", lat: -37.813, lng: 144.973, capacity: 30, active: true },
  { title: "Senior Walking Group", type: "walking", days: ["Wed","Fri"], address: "77 Lygon St, Carlton VIC", suburb: "Carlton", lat: -37.798, lng: 144.966, capacity: 50, active: true },
  { title: "Mixed Volleyball", type: "volleyball", days: ["Mon","Wed"], address: "25 Chapel St, Prahran VIC", suburb: "Prahran", lat: -37.849, lng: 144.993, capacity: 16, active: true },
  { title: "Park Run", type: "running", days: ["Sun"], address: "Royal Park, Parkville VIC", suburb: "Parkville", lat: -37.783, lng: 144.950, capacity: 200, active: true },
  { title: "Boxing for Wellbeing", type: "boxing", days: ["Tue","Thu"], address: "19 Sydney Rd, Coburg VIC", suburb: "Coburg", lat: -37.743, lng: 144.964, capacity: 10, active: true },
  { title: "Outdoor Bootcamp", type: "fitness", days: ["Mon","Wed","Fri"], address: "300 Victoria St, Richmond VIC", suburb: "Richmond", lat: -37.810, lng: 144.993, capacity: 20, active: true },
  { title: "Social Cricket", type: "cricket", days: ["Sat"], address: "Princes Park, Carlton North VIC", suburb: "Carlton North", lat: -37.784, lng: 144.964, capacity: 22, active: true }
]

async function seedPrograms() {
  const colRef = collection(db, 'programs')
  for (const p of programs) {
    await addDoc(colRef, {
      ...p,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }
  // eslint-disable-next-line no-console
  console.log('✅ Programs seeded successfully!')
}

seedPrograms()
