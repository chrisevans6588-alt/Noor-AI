
import { useState, useEffect } from 'react';
import {
 collection,
 doc,
 onSnapshot,
 setDoc,
 updateDoc,
 deleteDoc,
 query,
 where,
 Timestamp,
 writeBatch
} from 'firebase/firestore';
import { db } from '../services/firebaseClient';
import { Category, Task, Meeting, StatusOption, Email } from '../types';

export const useFirestoreSync = (user: any) => {
 const [categories, setCategories] = useState<Category[]>([]);
 const [tasks, setTasks] = useState<Task[]>([]);
 const [meetings, setMeetings] = useState<Meeting[]>([]);
 const [statuses, setStatuses] = useState<StatusOption[]>([]);
 const [emails, setEmails] = useState<Email[]>([]);
 const [loading, setLoading] = useState(true);

 // Helper to sort by order then createdAt
 const sortItems = (a: any, b: any) => {
   if (a.order !== undefined && b.order !== undefined && a.order !== b.order) {
     return a.order - b.order;
   }
   return (a.createdAt || 0) - (b.createdAt || 0);
 };

 // --- Real-time Listeners ---
 useEffect(() => {
   if (!user) {
     setCategories([]);
     setTasks([]);
     setMeetings([]);
     setStatuses([]);
     setEmails([]);
     setLoading(false);
     return;
   }

   const uid = user.uid;

   // 1. Categories Listener
   const categoriesQuery = query(collection(db, `users/${uid}/categories`));
   const unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
     const fetchedCats = snapshot.docs.map(doc => ({
       ...doc.data(),
       id: doc.id,
       isFeatured: doc.data().featured === true
     })) as Category[];
     setCategories(fetchedCats.sort(sortItems));
   }, (error) => {
     console.error("Error fetching categories:", error);
   });

   // 2. Tasks Listener
   const tasksQuery = query(collection(db, `users/${uid}/tasks`));
   const unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
     const fetchedTasks = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
     })) as Task[];
     setTasks(fetchedTasks.sort(sortItems));
   }, (error) => {
     console.error("Error fetching tasks:", error);
   });

   // 3. Meetings Listener
   const meetingsQuery = query(collection(db, `users/${uid}/meetings`));
   const unsubscribeMeetings = onSnapshot(meetingsQuery, (snapshot) => {
     const fetchedMeetings = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Meeting[];
     setMeetings(fetchedMeetings);
   }, (error) => {
      console.error("Error fetching meetings:", error);
   });

   // 4. Statuses Listener
   const statusesQuery = query(collection(db, `users/${uid}/statuses`));
   const unsubscribeStatuses = onSnapshot(statusesQuery, (snapshot) => {
     const fetchedStatuses = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as StatusOption[];
     setStatuses(fetchedStatuses);
   }, (error) => {
      console.error("Error fetching statuses:", error);
   });

   // 5. Emails Listener
   const emailsQuery = query(collection(db, 'mail'), where('uid', '==', uid));
   const unsubscribeEmails = onSnapshot(emailsQuery, (snapshot) => {
     const fetchedEmails = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Email[];
     // Client-side sort by createdAt desc
     setEmails(fetchedEmails.sort((a, b) => {
         const tA = a.createdAt?.seconds || (new Date(a.createdAt).getTime() / 1000) || 0;
         const tB = b.createdAt?.seconds || (new Date(b.createdAt).getTime() / 1000) || 0;
         return tB - tA;
     }));
   }, (error) => {
      console.error("Error fetching emails:", error);
   });

   setLoading(false);

   return () => {
     unsubscribeCategories();
     unsubscribeTasks();
     unsubscribeMeetings();
     unsubscribeStatuses();
     unsubscribeEmails();
   };
 }, [user]);

 // --- CRUD Operations ---

 const addCategory = async (cat: Category) => {
   if (!user) return;
   const data = {
     ...cat,
     uid: user.uid,
     featured: cat.isFeatured,
     parentId: cat.parentId || null
   };
   await setDoc(doc(db, `users/${user.uid}/categories/${cat.id}`), data);
 };

 const updateCategory = async (cat: Category) => {
   if (!user) return;
   const { isFeatured, ...rest } = cat;
   const data = { ...rest, featured: isFeatured };
   await updateDoc(doc(db, `users/${user.uid}/categories/${cat.id}`), data);
 };

 const deleteCategory = async (id: string) => {
   if (!user) return;
   await deleteDoc(doc(db, `users/${user.uid}/categories/${id}`));
 };

 const addTask = async (task: Task) => {
   if (!user) return;
   const data = { ...task, uid: user.uid };
   await setDoc(doc(db, `users/${user.uid}/tasks/${task.id}`), data);
 };

 const updateTask = async (task: Task) => {
   if (!user) return;
   await updateDoc(doc(db, `users/${user.uid}/tasks/${task.id}`), task);
 };

 const deleteTask = async (id: string) => {
   if (!user) return;
   await deleteDoc(doc(db, `users/${user.uid}/tasks/${id}`));
 };

 const addMeeting = async (meeting: Partial<Meeting>) => {
   if (!user || !meeting.id) return;
   const data: any = {
     name: meeting.name || "Untitled Meeting",
     meeting_link: meeting.meeting_link || "",
     event_link: meeting.event_link || "",
     google_calendar: meeting.google_calendar || "false",
     notes: meeting.notes || "",
     uid: user.uid,
     id: meeting.id,
     isCompleted: meeting.isCompleted || false,
     external_id: meeting.external_id || null,
     attendees: meeting.attendees || "[]",
     isStarred: meeting.isStarred || false,
     color: meeting.color || 'slate',
     syncStatus: meeting.syncStatus || 'synced'
   };
   if (meeting.start_time instanceof Date) {
     data.start_time = Timestamp.fromDate(meeting.start_time);
   } else if (meeting.start_time && (meeting.start_time as any).seconds) {
     data.start_time = meeting.start_time;
   } else {
     data.start_time = Timestamp.now();
   }
   if (meeting.end_time instanceof Date) {
     data.end_time = Timestamp.fromDate(meeting.end_time);
   } else if (meeting.end_time && (meeting.end_time as any).seconds) {
     data.end_time = meeting.end_time;
   } else {
     const d = new Date();
     d.setHours(d.getHours() + 1);
     data.end_time = Timestamp.fromDate(d);
   }
   await setDoc(doc(db, `users/${user.uid}/meetings/${meeting.id}`), data);
 };

 const updateMeeting = async (meeting: Meeting) => {
   if (!user) return;
   const data: any = { ...meeting };
   if (meeting.start_time instanceof Date) {
       data.start_time = Timestamp.fromDate(meeting.start_time);
   }
   if (meeting.end_time instanceof Date) {
       data.end_time = Timestamp.fromDate(meeting.end_time);
   }
   await updateDoc(doc(db, `users/${user.uid}/meetings/${meeting.id}`), data);
 };

 const deleteMeeting = async (id: string) => {
   if (!user) return;
   await deleteDoc(doc(db, `users/${user.uid}/meetings/${id}`));
 };

 const addStatus = async (status: StatusOption) => {
     if (!user) return;
     await setDoc(doc(db, `users/${user.uid}/statuses/${status.id}`), {
         ...status,
         uid: user.uid
     });
 };

 const updateStatus = async (status: StatusOption) => {
     if (!user) return;
     await updateDoc(doc(db, `users/${user.uid}/statuses/${status.id}`), status as any);
 };

 const deleteStatus = async (id: string) => {
     if (!user) return;
     await deleteDoc(doc(db, `users/${user.uid}/statuses/${id}`));
 };

 // --- Bulk / Reorder Operations ---

 const reorderTasks = async (updatedTasks: Task[]) => {
   if (!user) return;
   const batch = writeBatch(db);
   updatedTasks.forEach(t => {
     const ref = doc(db, `users/${user.uid}/tasks/${t.id}`);
     batch.update(ref, { order: t.order, categoryId: t.categoryId });
   });
   await batch.commit();
 };

 const reorderCategories = async (updatedCats: Category[]) => {
   if (!user) return;
   const batch = writeBatch(db);
   updatedCats.forEach(c => {
     const ref = doc(db, `users/${user.uid}/categories/${c.id}`);
     batch.update(ref, { order: c.order });
   });
   await batch.commit();
 };

 return {
   categories,
   setCategories,
   tasks,
   setTasks,
   meetings,
   statuses,
   emails,
   loading,
   addCategory,
   updateCategory,
   deleteCategory,
   addTask,
   updateTask,
   deleteTask,
   addMeeting,
   updateMeeting,
   deleteMeeting,
   addStatus,
   updateStatus,
   deleteStatus,
   reorderTasks,
   reorderCategories
 };
};
