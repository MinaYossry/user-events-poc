using Microsoft.AspNetCore.Mvc;
using UsersService.Data;

namespace UsersService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository userRepository;

        public UsersController(IUserRepository userRepository)
        {
            this.userRepository = userRepository;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var users = await userRepository.GetAll();
            return Ok(users);
        }


        [HttpPost]
        public async Task<IActionResult> Post(User user)
        {
            var addedUser= await userRepository.Add(user);
            return Ok(addedUser);
        }

        [HttpPut]
        public async Task<IActionResult> Put(User user)
        {
            var updatedUser = await userRepository.Update(user);
            return Ok(updatedUser);
        }


        [HttpDelete]
        public async Task<IActionResult> Delete(int id)
        {
            await userRepository.Delete(id);
            return Ok();
        }
    }
}