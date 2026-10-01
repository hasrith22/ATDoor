import ravi from "@/assets/providers/provider-ravi.jpg";
import suresh from "@/assets/providers/provider-suresh.jpg";
import arjun from "@/assets/providers/provider-arjun.jpg";
export const managerProviders = [
 { id:"PR-101", name:"Ravi Kumar", image:ravi, skills:["Plumbing","AC Repair"], rating:4.8, reviews:1284, status:"Available", activeJobs:1, todayJobs:4, completion:98, onTime:96, cancellation:2, repeat:47, distance:2.1, price:499, experience:"6+ years", areas:["Madhapur","Kondapur","Hitech City"] },
 { id:"PR-102", name:"Suresh Reddy", image:suresh, skills:["Plumbing","Maintenance"], rating:4.7, reviews:923, status:"Busy", activeJobs:1, todayJobs:5, completion:97, onTime:94, cancellation:3, repeat:42, distance:3.4, price:449, experience:"8+ years", areas:["Kondapur","Gachibowli"] },
 { id:"PR-103", name:"Arjun Services", image:arjun, skills:["Cleaning","General Repair"], rating:4.9, reviews:1542, status:"Available", activeJobs:0, todayJobs:3, completion:99, onTime:97, cancellation:1, repeat:54, distance:4.2, price:550, experience:"7+ years", areas:["Jubilee Hills","Banjara Hills"] },
 { id:"PR-104", name:"Imran Shaikh", image:ravi, skills:["Electrical","Water Heater"], rating:4.6, reviews:711, status:"On Break", activeJobs:0, todayJobs:3, completion:96, onTime:92, cancellation:4, repeat:38, distance:5.1, price:599, experience:"5+ years", areas:["Madhapur","Manikonda"] },
 { id:"PR-105", name:"Deepak Verma", image:suresh, skills:["Appliances","Refrigerator"], rating:4.8, reviews:1088, status:"Busy", activeJobs:1, todayJobs:4, completion:98, onTime:95, cancellation:2, repeat:45, distance:6.3, price:649, experience:"9+ years", areas:["Hitech City","Kukatpally"] },
 { id:"PR-106", name:"Lakshmi Home Care", image:arjun, skills:["Cleaning","Pest Control"], rating:4.5, reviews:582, status:"Offline", activeJobs:0, todayJobs:2, completion:95, onTime:91, cancellation:5, repeat:36, distance:7.8, price:399, experience:"4+ years", areas:["Secunderabad","Begumpet"] },
];
export const providerStats = [{label:"Total Providers",value:184},{label:"Available Now",value:52},{label:"Busy",value:78},{label:"Offline",value:41},{label:"Pending Verification",value:13}];
