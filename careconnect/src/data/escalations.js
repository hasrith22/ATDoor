export const initialEscalations = [
 {id:"ESC-1023",booking:"ATD-1025",customer:"Ananya Iyer",provider:"Suresh Reddy",issue:"Provider delayed by 45 minutes",category:"Delay",priority:"High",created:"18 min ago",status:"Open",notes:["Automated delay alert created."]},
 {id:"ESC-1024",booking:"ATD-1030",customer:"Arun Rao",provider:"Ravi Kumar",issue:"Provider cancelled close to appointment",category:"Cancellation",priority:"Urgent",created:"31 min ago",status:"Investigating",notes:["Customer informed about reassignment."]},
 {id:"ESC-1025",booking:"ATD-1019",customer:"Neha Gupta",provider:"QuickFix Team",issue:"Customer reported incomplete repair",category:"Service Quality",priority:"High",created:"1 hr ago",status:"Open",notes:["Photos requested from provider."]},
 {id:"ESC-1026",booking:"ATD-1022",customer:"Karan Patel",provider:"HomePro",issue:"Unexpected additional charge reported",category:"Payment Issue",priority:"Medium",created:"2 hrs ago",status:"Open",notes:["Invoice under review."]},
 {id:"ESC-1027",booking:"ATD-1017",customer:"Divya Rao",provider:"CleanCo",issue:"Customer unavailable at service address",category:"Customer Issue",priority:"Low",created:"3 hrs ago",status:"Resolved",notes:["Visit rescheduled for tomorrow."]},
];
export const escalationCategories=["All","Urgent","Provider Issue","Customer Issue","Delay","Cancellation","Payment Issue","Service Quality"];
