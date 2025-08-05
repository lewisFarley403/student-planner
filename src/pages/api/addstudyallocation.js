import { createAuthenticatedClient, getAuthToken } from '@/lib/apiUtils';

// Helper function to combine Date and Time into ISO String (UTC)
const createISOString = (dateStr, timeStr) => {
  // Basic check for expected formats
  if (!dateStr || !timeStr || !/\d{4}-\d{2}-\d{2}/.test(dateStr) || !/\d{2}:\d{2}/.test(timeStr)) {
    throw new Error('Invalid date or time format for ISO conversion');
  }
  // Creates Date object assuming input is local time, then converts to UTC ISO string
  return new Date(`${dateStr}T${timeStr}:00`).toISOString();
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      success: false, 
      error: `Method ${req.method} Not Allowed` 
    });
  }

  try {
    // Get token and create authenticated client
    const token = getAuthToken(req);
    const supabase = createAuthenticatedClient(token);

    // --- Get User ---
    // We need the user ID to fetch their specific allocations
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
        console.error("Auth error:", userError);
        return res.status(401).json({ success: false, error: 'Authentication failed or user not found.' });
    }

    // --- Data Validation ---
    console.log("req.body");
    console.log(req.body);
    const { module_title, date, startTime, endTime } = req.body;
    console.log(module_title);
    console.log(typeof module_title);
    if (!module_title || typeof module_title !== 'number') {
      return res.status(400).json({ success: false, error: 'Module title is required.' });
    }
    if (!date || !startTime || !endTime) {
      return res.status(400).json({ success: false, error: 'Date, start time, and end time are required.' });
    }
    
    // --- Combine Date/Time & Validate Chronology --- 
    let startTimeISO, endTimeISO;
    let newStartDateTime, newEndDateTime; // For comparison logic
    try {
      startTimeISO = createISOString(date, startTime);
      endTimeISO = createISOString(date, endTime);
      
      newStartDateTime = new Date(startTimeISO);
      newEndDateTime = new Date(endTimeISO);

      // Validate that end time is strictly after start time
      if (newEndDateTime <= newStartDateTime) {
        return res.status(400).json({ success: false, error: 'End time must be strictly after start time.' });
      }

      // NEW: Validate minimum duration of 10 minutes
      const minDurationMs = 10 * 60 * 1000; // 10 minutes in milliseconds
      if ((newEndDateTime - newStartDateTime) < minDurationMs) {
        return res.status(400).json({ success: false, error: 'It is not possible to add a task shorter than 10 minutes.' });
      }
    } catch (formatError) {
        console.error("Date/Time format error:", formatError);
        return res.status(400).json({ success: false, error: formatError.message });
    }
    
    // --- Overlap Check ---
    // Fetch existing allocations for this user on this specific date.
    // **Assumption:** Your 'study_allocations' table has a 'date' column (type date).
    // If not, revert this and check the server logs for the specific error with the previous .gte/.lt query.
    const { data: existingAllocations, error: fetchError } = await supabase
      .from('studyallocations') // Use correct table name
      .select('start_time, end_time') // Select only the times needed for comparison
      .eq('user_id', user.id) // Filter by the authenticated user

    if (fetchError) {
      console.error('Error fetching existing allocations:', fetchError);
      // Don't expose detailed db errors to client
      // ** If you still see this error, CHECK YOUR SERVER LOGS for the actual 'fetchError' details **
      return res.status(500).json({ success: false, error: 'Could not check existing allocations. Check table structure and server logs.' });
    }

    // Perform the overlap check logic
    if (existingAllocations && existingAllocations.length > 0) {
      for (const existing of existingAllocations) {
        const existingStart = new Date(existing.start_time); 
        const existingEnd = new Date(existing.end_time); 

        // Overlap condition: (NewStart < ExistingEnd) AND (NewEnd > ExistingStart)
        if (newStartDateTime < existingEnd && newEndDateTime > existingStart) {
          console.log('Overlap detected:', { new: { start: newStartDateTime, end: newEndDateTime }, existing: { start: existingStart, end: existingEnd } });
          return res.status(409).json({ // 409 Conflict status code
            success: false, 
            error: `Time slot overlaps with an existing allocation (${existingStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${existingEnd.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}).` 
          });
        }
      }
    }
    // --- End Overlap Check ---


    // --- Insert into Database (Only if no overlap) --- 
    const { data: newAllocation, error: insertError } = await supabase
      .from('studyallocations') // Use correct table name
      .insert([{ 
          time_goal_id: module_title, 
          start_time: startTimeISO, 
          end_time: endTimeISO,
          user_id: user.id // Explicitly set user_id although RLS should also cover it
      }])
      .select() // Select the newly created record(s)
      .single(); // Expecting only one record

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      // Check for specific DB constraint errors if needed, otherwise generic message
      // Example: if (insertError.code === '23505') { /* handle unique constraint */ }
      throw new Error(insertError.message || "Failed to save allocation to database."); 
    }

    if (!newAllocation) {
        throw new Error("Allocation record was not created successfully.");
    }

    // --- Success Response --- 
    return res.status(201).json({ // 201 Created status
      success: true,
      data: newAllocation // Return the created allocation
    });

  } catch (error) {
    console.error('Error in addstudyallocation API:', error);
    
    if (error.message === 'No authorization header') {
       return res.status(401).json({ success: false, error: error.message });
    }
    // Add other specific error checks as needed

    // Generic internal server error
    return res.status(500).json({
      success: false,
      // Avoid leaking sensitive info; use the specific messages thrown above for 4xx errors
      error: error.message || "Internal server error while adding study allocation." 
    });
  }
} 