using Application.DTOs.Requests;
using Application.DTOs.Responses;
using Application.Services.Interfaces;
using AutoMapper;
using Domain.Entities;
using Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Application.Services
{
    public class ChatService : IChatService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ChatService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ApiResponse<ChatRoomResponse>> GetOrCreateChatRoomAsync(int nguoiDungId)
        {
            try
            {
                Console.WriteLine($"ChatService - GetOrCreateChatRoomAsync for user: {nguoiDungId}");
                var existingRoom = await _unitOfWork.ChatRoom.GetByNguoiDungIdAsync(nguoiDungId);
                
                if (existingRoom != null)
                {
                    Console.WriteLine($"ChatService - Found existing room: {existingRoom.ChatRoomId}");
                    var roomResponse = _mapper.Map<ChatRoomResponse>(existingRoom);
                    return new ApiResponse<ChatRoomResponse>
                    {
                        Success = true,
                        Data = roomResponse,
                        Message = "Chat room retrieved successfully"
                    };
                }

                Console.WriteLine($"ChatService - Creating new room for user: {nguoiDungId}");
                // Tạo chat room mới
                var nguoiDung = await _unitOfWork.NguoiDung.GetByIdAsync(nguoiDungId);
                if (nguoiDung == null)
                {
                    Console.WriteLine($"ChatService - User not found: {nguoiDungId}");
                    return new ApiResponse<ChatRoomResponse>
                    {
                        Success = false,
                        Message = "User not found"
                    };
                }

                var newRoom = new ChatRoom
                {
                    NguoiDungId = nguoiDungId,
                    RoomName = $"Chat with {nguoiDung.HoTen}",
                    IsActive = true,
                    NgayTao = DateTime.Now
                };

                await _unitOfWork.ChatRoom.AddAsync(newRoom);
                await _unitOfWork.SaveChangesAsync();

                // Load lại với navigation properties
                newRoom = await _unitOfWork.ChatRoom.GetByNguoiDungIdAsync(nguoiDungId);
                var newRoomResponse = _mapper.Map<ChatRoomResponse>(newRoom);

                return new ApiResponse<ChatRoomResponse>
                {
                    Success = true,
                    Data = newRoomResponse,
                    Message = "Chat room created successfully"
                };
            }
            catch (Exception ex)
            {
                return new ApiResponse<ChatRoomResponse>
                {
                    Success = false,
                    Message = $"Error: {ex.Message}"
                };
            }
        }

        public async Task<ApiResponse<ChatMessageResponse>> SendMessageAsync(int nguoiDungId, SendMessageRequest request, bool isFromAdmin = false)
        {
            try
            {
                ChatRoom chatRoom;

                if (request.ChatRoomId.HasValue)
                {
                    chatRoom = await _unitOfWork.ChatRoom.GetByIdAsync(request.ChatRoomId.Value);
                    if (chatRoom == null)
                    {
                        return new ApiResponse<ChatMessageResponse>
                        {
                            Success = false,
                            Message = "Chat room not found"
                        };
                    }
                }
                else
                {
                    // Tạo hoặc lấy chat room cho user
                    var roomResult = await GetOrCreateChatRoomAsync(nguoiDungId);
                    if (!roomResult.Success)
                    {
                        return new ApiResponse<ChatMessageResponse>
                        {
                            Success = false,
                            Message = roomResult.Message
                        };
                    }
                    chatRoom = await _unitOfWork.ChatRoom.GetByIdAsync(roomResult.Data.ChatRoomId);
                }

                // CRITICAL FIX: Sử dụng transaction để đảm bảo consistency
                await _unitOfWork.BeginTransactionAsync();
                
                try
                {
                    var message = new ChatMessage
                    {
                        ChatRoomId = chatRoom.ChatRoomId,
                        NguoiDungId = nguoiDungId,
                        NoiDung = request.NoiDung,
                        IsFromAdmin = isFromAdmin,
                        DaDoc = false,
                        NgayGui = DateTime.Now
                    };

                    await _unitOfWork.ChatMessage.AddAsync(message);

                    // Cập nhật thời gian chat room
                    chatRoom.NgayCapNhat = DateTime.Now;
                    _unitOfWork.ChatRoom.Update(chatRoom);

                    await _unitOfWork.SaveChangesAsync();
                    await _unitOfWork.CommitTransactionAsync();

                    // Load lại message với navigation properties
                    message = await _unitOfWork.ChatMessage.GetByIdAsync(message.ChatMessageId);
                    var messageResponse = _mapper.Map<ChatMessageResponse>(message);

                    return new ApiResponse<ChatMessageResponse>
                    {
                        Success = true,
                        Data = messageResponse,
                        Message = "Message sent successfully"
                    };
                }
                catch
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    throw;
                }
            }
            catch (Exception ex)
            {
                return new ApiResponse<ChatMessageResponse>
                {
                    Success = false,
                    Message = $"Error: {ex.Message}"
                };
            }
        }

        public async Task<ApiResponse<List<ChatRoomResponse>>> GetActiveChatRoomsAsync()
        {
            try
            {
                var chatRooms = await _unitOfWork.ChatRoom.GetActiveChatRoomsAsync();
                var responses = new List<ChatRoomResponse>();

                foreach (var room in chatRooms)
                {
                    var response = _mapper.Map<ChatRoomResponse>(room);
                    
                    // Lấy số tin nhắn chưa đọc từ user
                    response.UnreadMessageCount = await _unitOfWork.ChatMessage.GetUnreadMessageCountAsync(room.ChatRoomId, true);
                    
                    // Lấy tin nhắn cuối cùng
                    var lastMessage = room.ChatMessages?.OrderByDescending(m => m.NgayGui).FirstOrDefault();
                    if (lastMessage != null)
                    {
                        response.LastMessage = _mapper.Map<ChatMessageResponse>(lastMessage);
                    }

                    responses.Add(response);
                }

                return new ApiResponse<List<ChatRoomResponse>>
                {
                    Success = true,
                    Data = responses,
                    Message = "Chat rooms retrieved successfully"
                };
            }
            catch (Exception ex)
            {
                return new ApiResponse<List<ChatRoomResponse>>
                {
                    Success = false,
                    Message = $"Error: {ex.Message}"
                };
            }
        }

        public async Task<ApiResponse<ChatRoomResponse>> GetChatRoomWithMessagesAsync(int chatRoomId)
        {
            try
            {
                var chatRoom = await _unitOfWork.ChatRoom.GetChatRoomWithMessagesAsync(chatRoomId);
                if (chatRoom == null)
                {
                    return new ApiResponse<ChatRoomResponse>
                    {
                        Success = false,
                        Message = "Chat room not found"
                    };
                }

                var response = _mapper.Map<ChatRoomResponse>(chatRoom);
                response.Messages = chatRoom.ChatMessages?.Select(m => _mapper.Map<ChatMessageResponse>(m)).ToList() ?? new List<ChatMessageResponse>();

                return new ApiResponse<ChatRoomResponse>
                {
                    Success = true,
                    Data = response,
                    Message = "Chat room with messages retrieved successfully"
                };
            }
            catch (Exception ex)
            {
                return new ApiResponse<ChatRoomResponse>
                {
                    Success = false,
                    Message = $"Error: {ex.Message}"
                };
            }
        }

        public async Task<ApiResponse<bool>> MarkMessagesAsReadAsync(int chatRoomId, bool isFromAdmin)
        {
            try
            {
                await _unitOfWork.ChatMessage.MarkMessagesAsReadAsync(chatRoomId, isFromAdmin);
                await _unitOfWork.SaveChangesAsync();

                return new ApiResponse<bool>
                {
                    Success = true,
                    Data = true,
                    Message = "Messages marked as read"
                };
            }
            catch (Exception ex)
            {
                return new ApiResponse<bool>
                {
                    Success = false,
                    Message = $"Error: {ex.Message}"
                };
            }
        }

        public async Task<ApiResponse<int>> GetUnreadMessageCountAsync(int chatRoomId, bool isFromAdmin)
        {
            try
            {
                var count = await _unitOfWork.ChatMessage.GetUnreadMessageCountAsync(chatRoomId, isFromAdmin);

                return new ApiResponse<int>
                {
                    Success = true,
                    Data = count,
                    Message = "Unread message count retrieved"
                };
            }
            catch (Exception ex)
            {
                return new ApiResponse<int>
                {
                    Success = false,
                    Message = $"Error: {ex.Message}"
                };
            }
        }
    }
}