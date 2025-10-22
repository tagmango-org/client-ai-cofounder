export interface Conversation {
  id: string;
  title: string;
  created_date: string;
  updated_date: string;
  app_user_id: string;
}

export interface CreateConversationRequest {
  title: string;
}

export interface UpdateConversationRequest {
  title?: string;
}

export interface ConversationResponse {
  success: boolean;
  data?: {
    conversation?: Conversation;
    conversations?: Conversation[];
  };
  message?: string;
  error?: string;
}

// Get all conversations for a user
export const getConversations = async (
  userId: string
): Promise<ConversationResponse> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/conversations`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "user-id": userId,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};

// Create a new conversation
export const createConversation = async (
  userId: string,
  conversationData: CreateConversationRequest
): Promise<ConversationResponse> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/conversations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": userId,
        },
        body: JSON.stringify(conversationData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};

// Get a specific conversation
export const getConversation = async (
  userId: string,
  conversationId: string
): Promise<ConversationResponse> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/conversations/${conversationId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "user-id": userId,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching conversation:", error);
    throw error;
  }
};

// Update a conversation
export const updateConversation = async (
  userId: string,
  conversationId: string,
  updates: UpdateConversationRequest
): Promise<ConversationResponse> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/conversations/${conversationId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "user-id": userId,
        },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating conversation:", error);
    throw error;
  }
};

// Delete a conversation
export const deleteConversation = async (
  userId: string,
  conversationId: string
): Promise<ConversationResponse> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/conversations/${conversationId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "user-id": userId,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting conversation:", error);
    throw error;
  }
};
