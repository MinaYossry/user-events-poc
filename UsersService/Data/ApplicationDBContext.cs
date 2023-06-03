using Microsoft.EntityFrameworkCore;

namespace UsersService.Data
{
    public class ApplicationDBContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public ApplicationDBContext(DbContextOptions<ApplicationDBContext> options)
            : base(options)
        {

        }
    }
}
