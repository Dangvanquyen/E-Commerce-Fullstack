using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Collections.Concurrent;

namespace WebAPIs.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private static readonly ConcurrentDictionary<string, string> UserConnections = new();
        private static readonly ConcurrentDictionary<string, List<string>> AdminConnections = new();

        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"ChatHub - Connection attempt from: {Context.ConnectionId}");
            
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = Context.User?.FindFirst(ClaimTypes.Role)?.Value;

            Console.WriteLine($"ChatHub - OnConnectedAsync: UserId={userId}, Role={userRole}");
            Console.WriteLine($"ChatHub - User authenticated: {Context.User?.Identity?.IsAuthenticated}");

            // SECURITY: Require authentication
            if (string.IsNullOrEmpty(userId) || !Context.User.Identity.IsAuthenticated)
            {
                Console.WriteLine($"ChatHub - No user info or not authenticated, rejecting connection");
                Context.Abort();
                return;
            }

            if (userRole == "Admin")
            {
                Console.WriteLine($"ChatHub - Adding admin connection: {userId}");
                // Admin có thể có nhiều connections
                if (!AdminConnections.ContainsKey(userId))
                {
                    AdminConnections[userId] = new List<string>();
                }
                AdminConnections[userId].Add(Context.ConnectionId);
                
                // Join admin group
                await Groups.AddToGroupAsync(Context.ConnectionId, "Admins");
                Console.WriteLine($"ChatHub - Admin joined Admins group");
            }
            else
            {
                Console.WriteLine($"ChatHub - Adding user connection: {userId}");
                // User chỉ có 1 connection
                UserConnections[userId] = Context.ConnectionId;
                
                // Notify admins that user is online
                await Clients.Group("Admins").SendAsync("UserOnline", userId);
                Console.WriteLine($"ChatHub - Notified admins about user online");
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = Context.User?.FindFirst(ClaimTypes.Role)?.Value;

            if (!string.IsNullOrEmpty(userId))
            {
                if (userRole == "Admin")
                {
                    if (AdminConnections.ContainsKey(userId))
                    {
                        AdminConnections[userId].Remove(Context.ConnectionId);
                        if (!AdminConnections[userId].Any())
                        {
                            AdminConnections.TryRemove(userId, out _);
                        }
                    }
                }
                else
                {
                    UserConnections.TryRemove(userId, out _);
                    
                    // Notify admins that user is offline
                    await Clients.Group("Admins").SendAsync("UserOffline", userId);
                }
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task JoinChatRoom(string chatRoomId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"ChatRoom_{chatRoomId}");
        }

        public async Task LeaveChatRoom(string chatRoomId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"ChatRoom_{chatRoomId}");
        }

        public static string GetUserConnectionId(string userId)
        {
            UserConnections.TryGetValue(userId, out var connectionId);
            return connectionId;
        }

        public static List<string> GetAdminConnectionIds()
        {
            return AdminConnections.Values.SelectMany(x => x).ToList();
        }

        public static bool IsUserOnline(string userId)
        {
            return UserConnections.ContainsKey(userId);
        }

        public static List<string> GetOnlineUserIds()
        {
            return UserConnections.Keys.ToList();
        }
    }
}