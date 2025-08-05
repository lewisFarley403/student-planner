import { createAuthenticatedClient, getAuthToken } from '@/lib/apiUtils';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ 
      success: false, 
      error: `Method ${req.method} Not Allowed` 
    });
  }

  try {
    // Get token and create authenticated client
    const token = getAuthToken(req);
    const supabase = createAuthenticatedClient(token);

    // Fetch goals for the user
    // Note: Using "userID" as per the schema provided
    const { data: goals, error } = await supabase
      .from('timeGoal') // Match table name case 'timeGoal'
      .select('*') // Select only the title and id
      // The user ID is implicitly handled by the authenticated client
      // and RLS policy, but we could add explicit check if needed:
      // .eq('userID', user.id) // Needs user object if added

    if (error) {
      console.error("Supabase error fetching time goals:", error);
      throw error; // Throw error to be caught by the catch block
    }

    // Extract titles or return empty array if no goals
    const goalTitles = goals ? goals.map(g => ({title:g.title,ID:g.id})) : [];

    return res.status(200).json({
      success: true,
      data: goalTitles
    });

  } catch (error) {
    console.error('Error in gettimegoals API:', error);
    
    if (error.message === 'No authorization header') {
       return res.status(401).json({ success: false, error: error.message });
    }
    
    // Handle potential Supabase errors (e.g., RLS issues)
    if (error.code) { // Supabase errors often have a code
        return res.status(500).json({ success: false, error: `Database error: ${error.message}` });
    }

    // Generic internal server error
    return res.status(500).json({
      success: false,
      error: "Internal server error while fetching time goals."
    });
  }
} 