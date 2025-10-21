export interface Message {
  id: string;
  conversationId: string;
  content: string;
  role: "user" | "assistant";
  created_date: string;
  metadata?: Record<string, any>;
  courseDataAvailable?: boolean; // New optional field
}

export interface CreateMessageRequest {
  conversationId: string;
  content: string;
  role: "user" | "assistant";
  metadata?: Record<string, any>;
  courseDataAvailable?: boolean; // New optional field
}

export interface UpdateMessageRequest {
  content?: string;
  metadata?: Record<string, any>;
}

export interface MessageResponse {
  success: boolean;
  data?: {
    message?: Message;
    messages?: Message[];
    hasMore?: boolean;
    nextCursor?: string | null;
  };
  message?: string;
  error?: string;
}

// Get messages for a conversation with pagination
export const getMessages = async (
  userId: string,
  conversationId: string,
  cursor?: string,
  limit: number = 50
): Promise<MessageResponse> => {
  try {
    const params = new URLSearchParams({
      conversationId,
      limit: limit.toString(),
    });

    if (cursor) {
      params.append("cursor", cursor);
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/messages?${params}`,
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

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
};

// Create a new message
export const createMessage = async (
  userId: string,
  messageData: CreateMessageRequest
): Promise<MessageResponse> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "user-id": userId,
        },
        body: JSON.stringify(messageData),
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
    console.error("Error creating message:", error);
    throw error;
  }
};

// Get a specific message
export const getMessage = async (
  userId: string,
  messageId: string
): Promise<MessageResponse> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/messages/${messageId}`,
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
    console.error("Error fetching message:", error);
    throw error;
  }
};

// Update a message
export const updateMessage = async (
  userId: string,
  messageId: string,
  updates: UpdateMessageRequest
): Promise<MessageResponse> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/messages/${messageId}`,
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
    console.error("Error updating message:", error);
    throw error;
  }
};

// Delete a message
export const deleteMessage = async (
  userId: string,
  messageId: string
): Promise<MessageResponse> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/messages/${messageId}`,
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
    console.error("Error deleting message:", error);
    throw error;
  }
};
