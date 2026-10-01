import { AirVent, Armchair, Brush, Bug, CircuitBoard, Droplets, Flame, Hammer, Refrigerator, Sparkles, WashingMachine, Wrench } from "lucide-react";
import plumbingImage from "@/assets/banners/plumbing.jpg";
import electricalImage from "@/assets/banners/electrical.jpg";
import acImage from "@/assets/banners/ac-service.jpg";
import raviImage from "@/assets/providers/provider-ravi.jpg";
import sureshImage from "@/assets/providers/provider-suresh.jpg";
import arjunImage from "@/assets/providers/provider-arjun.jpg";

export const categories = [
  { id: "ac", name: "AC & Cooling", icon: AirVent, image: acImage, price: "₹599", description: "Service, repair and installation", options: ["AC inspection", "AC service", "Cooling repair", "Installation"] },
  { id: "appliance", name: "Appliance Repair", icon: Wrench, image: electricalImage, price: "₹399", description: "Repairs for everyday appliances", options: ["Microwave repair", "Chimney service", "TV repair", "Small appliances"] },
  { id: "plumbing", name: "Plumbing", icon: Droplets, image: plumbingImage, price: "₹449", description: "Leaks, fittings and installations", options: ["Leakage & Connections", "Tap & Mixer Repair", "Drain cleaning", "Bathroom fittings"] },
  { id: "electrical", name: "Electrical", icon: CircuitBoard, image: electricalImage, price: "₹349", description: "Wiring, switches and fixtures", options: ["Switch repair", "Fan installation", "Wiring check", "Power issue"] },
  { id: "cleaning", name: "Home Cleaning", icon: Sparkles, image: plumbingImage, price: "₹699", description: "Deep cleaning for every room", options: ["Full home cleaning", "Bathroom cleaning", "Kitchen cleaning", "Sofa cleaning"] },
  { id: "carpentry", name: "Carpentry", icon: Hammer, image: electricalImage, price: "₹399", description: "Furniture repair and fitting", options: ["Furniture repair", "Door repair", "Shelf installation", "Custom fitting"] },
  { id: "painting", name: "Painting", icon: Brush, image: acImage, price: "₹1,499", description: "Interior touch-ups and painting", options: ["Wall painting", "Touch-up", "Waterproofing", "Texture painting"] },
  { id: "pest", name: "Pest Control", icon: Bug, image: plumbingImage, price: "₹799", description: "Safe treatment for common pests", options: ["Cockroach control", "Termite control", "Mosquito control", "Rodent control"] },
  { id: "washing", name: "Washing Machine", icon: WashingMachine, image: electricalImage, price: "₹499", description: "Repair and preventive service", options: ["Not spinning", "Water leakage", "Installation", "General service"] },
  { id: "fridge", name: "Refrigerator", icon: Refrigerator, image: acImage, price: "₹499", description: "Cooling and electrical repair", options: ["Not cooling", "Water leakage", "Noise issue", "General service"] },
  { id: "heater", name: "Water Heater", icon: Flame, image: electricalImage, price: "₹449", description: "Repair, service and fitting", options: ["Not heating", "Installation", "Leakage", "General service"] },
  { id: "maintenance", name: "General Maintenance", icon: Armchair, image: plumbingImage, price: "₹399", description: "Everyday home fixes", options: ["Home inspection", "Minor repairs", "Fixture fitting", "Maintenance visit"] },
];

export const providers = [
  { id: 1, name: "Ravi Kumar", service: "Plumbing Specialist", rating: 4.8, reviews: 1284, availability: "Available now", price: 499, response: "Responds in 5 min", experience: "6+ years", image: raviImage },
  { id: 2, name: "Suresh Reddy", service: "Home Plumbing Expert", rating: 4.7, reviews: 923, availability: "Available in 20 min", price: 449, response: "Responds in 8 min", experience: "5+ years", image: sureshImage },
  { id: 3, name: "Arjun Services", service: "Plumbing & Maintenance", rating: 4.9, reviews: 1542, availability: "Available today", price: 550, response: "Responds in 12 min", experience: "8+ years", image: arjunImage },
];

export const notifications = [
  { text: "Ravi Kumar accepted your booking.", time: "2 min", unread: true },
  { text: "Your provider is 10 minutes away.", time: "8 min", unread: true },
  { text: "Your AC service is scheduled for tomorrow.", time: "1 hr", unread: false },
  { text: "Your invoice is ready.", time: "Yesterday", unread: false },
];

export const bookings = {
  active: [{ id: "ATD-2026-00124", service: "Tap & Mixer Repair", provider: "Ravi Kumar", status: "In Progress", note: "Provider is on the way", date: "Today", time: "10:00 AM", eta: "12 minutes", price: 499 }],
  upcoming: [{ id: "ATD-2026-00131", service: "AC Service", provider: "Suresh Reddy", status: "Confirmed", note: "Your appointment is scheduled", date: "Tomorrow", time: "10:00 AM", price: 799 }],
  completed: [{ id: "ATD-2026-00086", service: "Electrical Repair", provider: "Arjun Services", status: "Completed", note: "Service completed on 18 Sep", date: "18 Sep 2026", time: "4:30 PM", price: 650, rating: 5 }],
};
