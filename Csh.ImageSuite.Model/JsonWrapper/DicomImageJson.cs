using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Csh.ImageSuite.Model.JsonWrapper
{
    public class RevKeyImage
    {
        public string Id { get; set; }
        public bool Marked { get; set; }
    }

    public class RevAnnImage
    {
        public string Id { get; set; }
        public string AnnString { get; set; }
    }
}
