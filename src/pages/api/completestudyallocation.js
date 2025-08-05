import { createAuthenticatedClient, getAuthToken } from '@/lib/apiUtils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ 
      success: false, 
      error: `Method ${req.method} Not Allowed` 
    });
  }6

  try {
    console.log("completestudyallocation");
    // Get token and create authenticated client
    const token = getAuthToken(req);
    const supabase = createAuthenticatedClient(token);

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      return res.status(401).json({ success: false, error: 'Authentication failed or user not found.' });
    }

    let { allocationId, description, completedWithPomodoro } = req.body;

    // DEBUG: Hardcode allocationId to 29 for testing. Remove after debugging.
    allocationId = 29;

    if (!allocationId) {
      return res.status(400).json({ success: false, error: 'Allocation ID is required.' });
    }

    // TODO: Description validation may need to be reactivated in the future
    // if (!description || description.trim() === '') {
    //   return res.status(400).json({ success: false, error: 'Please provide a description of what you studied.' });
    // }

    // First check if the allocation exists and belongs to the user
    const { data: existingAllocation, error: fetchError } = await supabase
      .from('studyallocations')
      .select('id, user_id')
      .eq('id', allocationId)
      .single();

    if (fetchError) {
      console.error('Error fetching allocation:', fetchError);
      return res.status(404).json({ 
        success: false, 
        error: 'Study allocation not found or you do not have permission to access it.' 
      });
    }

    if (existingAllocation.user_id !== user.id) {
      return res.status(403).json({ 
        success: false, 
        error: 'You do not have permission to complete this study allocation.' 
      });
    }

    // Update the allocation to mark it as complete
    console.log("updating allocation", allocationId, user.id);
    const { data: debugAlloc, error: debugError } = await supabase
      .from('studyallocations')
      .select('*')
      .eq('id', allocationId)
      .eq('user_id', user.id);
    
    console.log("debugAlloc", debugAlloc);
    console.log("debugError", debugError);
    if (debugAlloc && debugAlloc.length > 0) {
      console.log("debugAlloc user_id:", debugAlloc[0].user_id);
      console.log("current user.id:", user.id);
    }

    const { data: updatedAllocation, error: updateError } = await supabase
      .from('studyallocations')
      .update({ 
        completed: true,
        completion_description: description,
        completed_at: new Date().toISOString()
      })
      .eq('id', allocationId)
      .eq('user_id', user.id) // Ensure user owns this allocation
      .select()
      .single();

    if (updateError) {
      console.error('Error updating allocation:', updateError);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to mark allocation as complete.' 
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedAllocation
    });

  } catch (error) {
    console.error('Error in completestudyallocation API:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error while completing study allocation.'
    });
  }
} 