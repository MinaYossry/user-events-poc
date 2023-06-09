﻿namespace UsersService.Data
{
    public class UserEvent
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public EventType Type { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public User UserData { get; set; }
    }

    public enum EventType
    {
        Created = 0,
        Updated = 1,
        Deleted = 2,
    }
}
