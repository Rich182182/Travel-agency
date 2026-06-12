using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelAgency.DAL.Entities.Enums;

namespace TravelAgency.BLL.DTOs
{
    public class ChangeRoleDto
    {
        public Role NewRole { get; set; }
    }
}
