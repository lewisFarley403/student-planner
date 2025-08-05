import { createAuthenticatedClient, getAuthToken } from '@/lib/apiUtils';

const handleGetRequest = async (token, date) => {
  const supabase = createAuthenticatedClient(token);
  
  let query = supabase
    .from('studyallocations')
    .select(`
      id,
      start_time,
      end_time,
      time_goal_id,
      completed,
      timeGoal (
        id,
        title,
        module_colour
      )
    `)
    .order('start_time', { ascending: true });

  if (date) {
    // Ensure 'date' is treated as the start of the day in the user's local timezone
    // or UTC depending on how timestamps are stored and handled.
    // Supabase client often handles date string interpretation well.
    
    // date parameter should be 'YYYY-MM-DD'
    const startDate = date; 
    
    // Calculate the start of the next day
    try {
      const nextDayDate = new Date(date);
      if (isNaN(nextDayDate)) {
        throw new Error('Invalid date format provided');
      }
      nextDayDate.setDate(nextDayDate.getDate() + 1);
      // Format the next day back to 'YYYY-MM-DD'
      const nextDayYear = nextDayDate.getFullYear();
      const nextDayMonth = (nextDayDate.getMonth() + 1).toString().padStart(2, '0');
      const nextDayDay = nextDayDate.getDate().toString().padStart(2, '0');
      const endDate = `${nextDayYear}-${nextDayMonth}-${nextDayDay}`;

      console.log(`Filtering start_time between ${startDate} (inclusive) and ${endDate} (exclusive)`); // Debug log

      // Apply the range filter
      query = query
        .gte('start_time', startDate) // Greater than or equal to the start of the provided date
        .lt('start_time', endDate);   // Less than the start of the next date
        
    } catch (e) {
       console.error("Error processing date for filtering:", e);
       // Decide how to handle invalid date format - perhaps return empty or throw error
       throw new Error("Invalid date provided for filtering");
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Supabase query error:", error);
    throw error;
  }
  console.log(data);

  // Only return the fields you want
  return data;
};

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ 
        success: false, 
        error: 'Method not allowed' 
      });
    }

    const { date } = req.query; // Expecting 'YYYY-MM-DD' format

    const token = getAuthToken(req);
    // console.log("Received date for filtering:", date); // Keep or remove debug log as needed
    const data = await handleGetRequest(token, date);

    return res.status(200).json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Error in study allocations API:', error);
    
    // Handle specific known errors
    if (error.message === 'No authorization header') {
       return res.status(401).json({ success: false, error: error.message });
    }
    if (error.message === 'Invalid date provided for filtering') {
       return res.status(400).json({ success: false, error: error.message }); // Bad Request
    }
    
    // Generic internal server error
    return res.status(500).json({
      success: false,
      error: "Internal server error while fetching study allocations." // Avoid leaking detailed errors
    });
  }
} 