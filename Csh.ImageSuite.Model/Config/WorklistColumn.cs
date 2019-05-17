using System;
using System.Collections.Generic;

namespace Csh.ImageSuite.Model.Config
{
    [Serializable]
    public class WorklistColumn
    {
        public string ColumnId { get; set; }

        public string ColumnText
        {
            get; set;
        }

        public int ColumnSequence
        {
            get; set;
        }

        public string SortDirection
        {
            get; set;
        }

        public string ControlType
        {
            get; set;
        }

        public Dictionary<string, string> ValueList
        {
            get; set;
        }

        public string OverlayID
        {
            get;
            set;
        }

        public bool Visible
        {
            get; set;
        }

        public string UserDefinedName
        {
            get;
            set;
        }
    }
}
