using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Csh.ImageSuite.Model.Config;
using Csh.ImageSuite.Model.Dicom;

namespace Csh.ImageSuite.Model.JsonWrapper
{
    public class RevStudiesForDcmViewer
    {
        public int Id { get; set; }
        public bool ShowHistoryStudies { get; set; }
        public bool ShowKeyImage { get; set; }
    }

    public class RevStudyData
    {
        public QueryShortcut Shortcut { get; set; }
        public int PageIndex { get; set; }
        public string SortItem { get; set; }
    }

    public class SendStudyData
    {
        public List<Study> StudyList { get; set; }
        public List<WorklistColumn> WorklistColumns { get; set; }
        public int PageCount { get; set; }
    }
}
