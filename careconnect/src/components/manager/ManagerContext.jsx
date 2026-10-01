import { createContext, useContext, useMemo, useState } from "react";
import { initialManagerBookings } from "@/data/managerBookings";
import { managerProviders } from "@/data/providers";
import { initialEscalations } from "@/data/escalations";

const ManagerContext=createContext(null);
export function ManagerProvider({children}){
 const [bookings,setBookings]=useState(initialManagerBookings);const [escalations,setEscalations]=useState(initialEscalations);const [selectedBooking,setSelectedBooking]=useState(null);const [selectedProvider,setSelectedProvider]=useState(null);const [selectedEscalation,setSelectedEscalation]=useState(null);const [assignment,setAssignment]=useState(null);const [toast,setToast]=useState("");
 const notify=(message)=>{setToast(message);window.setTimeout(()=>setToast(""),2600)};
 const updateBooking=(id,updates)=>{setBookings(rows=>rows.map(row=>row.id===id?{...row,...updates}:row));setSelectedBooking(row=>row?.id===id?{...row,...updates}:row)};
 const assignProvider=(booking,provider,reassign=false)=>{updateBooking(booking.id,{provider:provider.name,status:"Assigned",rating:provider.rating,stage:3});setAssignment(null);notify(reassign?"Provider reassigned successfully.":"Provider assigned successfully.")};
 const resolveEscalation=(id)=>{setEscalations(rows=>rows.map(row=>row.id===id?{...row,status:"Resolved"}:row));setSelectedEscalation(row=>row?.id===id?{...row,status:"Resolved"}:row);notify("Escalation resolved successfully.")};
 const addNote=(id,note)=>{if(!note.trim())return;setEscalations(rows=>rows.map(row=>row.id===id?{...row,notes:[...row.notes,note]}:row));setSelectedEscalation(row=>row?.id===id?{...row,notes:[...row.notes,note]}:row);notify("Internal note saved.")};
 const value=useMemo(()=>({bookings,providers:managerProviders,escalations,selectedBooking,setSelectedBooking,selectedProvider,setSelectedProvider,selectedEscalation,setSelectedEscalation,assignment,setAssignment,updateBooking,assignProvider,resolveEscalation,addNote,notify}),[bookings,escalations,selectedBooking,selectedProvider,selectedEscalation,assignment]);
 return <ManagerContext.Provider value={value}>{children}{toast&&<div className="fixed bottom-5 right-5 z-[80] rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-panel animate-in slide-in-from-bottom-2">{toast}</div>}</ManagerContext.Provider>
}
export function useManager(){const value=useContext(ManagerContext);if(!value)throw new Error("useManager must be used inside ManagerProvider");return value}
