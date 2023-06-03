namespace UsersService.Data
{
    public interface IUserRepository
    {
        Task<List<User>> GetAll();
        Task<User> Add(User user);
        Task<User> Update(User user);
        Task Delete(int id);
    }
}
