using System.Collections.Generic;

namespace Csh.ImageSuite.Model.Config
{
    public class MarkerData
    {
        public string DisplayText { get; set; }
        public string ImageName { get; set; }
    }

    public class MarkerGroupData
    {
        public string GroupName { get; set; }
        public IList<IList<MarkerData>> MarkerDataTable { get; set; }
    }
}