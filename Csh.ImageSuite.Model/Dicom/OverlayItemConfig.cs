using System;

namespace Csh.ImageSuite.Model.Dicom
{
    public class OverlayItemConfig
    {
        public int GridX { get; set; }

        public int GridY { get; set; }

        public int OffsetX { get; set; }

        public int OffsetY { get; set; }

        public string Prefix { get; set; }

        public string Suffix { get; set; }

        public string OverlayId { get; set; }

        public string OverlayName { get; set; }

        public string OverlayUid { get; set; }

        public string Modality { get; set; }

        public string LocalName { get; set; }

        public string DicomName { get; set; }

        public string TableName { get; set; }

        public string FieldName { get; set; }

        public ushort GroupNumber { get; set; }

        public ushort ElementNumber { get; set; }

        public bool FromString(string str)
        {
            // Sample value : Uid|GridX|GridY|OffsetX|OffsetY|Prefix|Suffix
            try
            {
                var strList = str.Split('|');
                var i = 0;

                OverlayUid = strList[i++];
                GridX = int.Parse(strList[i++]) / 4;
                GridY = int.Parse(strList[i++]) / 4;
                OffsetX = int.Parse(strList[i++]);
                OffsetY = int.Parse(strList[i++]);
                Prefix = strList[i++];
                Suffix = strList[i++];

                // Change the Prefix&Suffix blank value
                Prefix = Prefix.Replace("^", "");
                Suffix = Suffix.Replace("^", "");
            }
            catch (Exception e)
            {
                return false;
            }

            return true;

        }
    }
}