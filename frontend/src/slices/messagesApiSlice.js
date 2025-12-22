import { apiSlice } from "./apiSlice";
import { MESSAGES_URL } from "../constants";

export const messagesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all conversations for the current user
    getConversations: builder.query({
      query: () => ({
        url: `${MESSAGES_URL}/conversations`,
      }),
      providesTags: ["Message"],
      keepUnusedDataFor: 5,
    }),
    // Get a single conversation by ID
    getConversationById: builder.query({
      query: (conversationId) => ({
        url: `${MESSAGES_URL}/conversations/${conversationId}`,
      }),
      providesTags: ["Message"],
      keepUnusedDataFor: 5,
    }),
    // Create or get existing conversation
    createOrGetConversation: builder.mutation({
      query: (data) => ({
        url: `${MESSAGES_URL}/conversations`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Message"],
    }),
    // Get messages in a conversation
    getMessages: builder.query({
      query: ({ conversationId, page = 1, limit = 50 }) => ({
        url: `${MESSAGES_URL}/conversations/${conversationId}/messages`,
        params: { page, limit },
      }),
      providesTags: ["Message"],
      keepUnusedDataFor: 5,
    }),
    // Send a message
    sendMessage: builder.mutation({
      query: (data) => ({
        url: MESSAGES_URL,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Message"],
    }),
    // Get list of sellers
    getSellers: builder.query({
      query: () => ({
        url: `${MESSAGES_URL}/sellers`,
      }),
      keepUnusedDataFor: 5,
    }),
    // Get list of buyers/users
    getBuyers: builder.query({
      query: () => ({
        url: `${MESSAGES_URL}/buyers`,
      }),
      keepUnusedDataFor: 5,
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationByIdQuery,
  useCreateOrGetConversationMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useGetSellersQuery,
  useGetBuyersQuery,
} = messagesApiSlice;

