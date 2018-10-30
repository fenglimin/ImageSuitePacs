using System.Data;
using Csh.ImageSuite.Model.Dicom;

namespace Csh.ImageSuite.Common.Interface
{
    public interface IPssiObjectCreator
    {
        /// <summary>
        /// Create Patient from datarow queried from database
        /// </summary>
        /// <param name="row"></param>
        /// <returns></returns>
        Patient CreatPatient(DataRow row);

        /// <summary>
        /// Create Study from datarow queried from database
        /// </summary>
        /// <param name="row"></param>
        /// <returns></returns>
        Study CreateStudy(DataRow row);

        /// <summary>
        /// Create Series from datarow queried from database
        /// </summary>
        /// <param name="row"></param>
        /// <returns></returns>
        Series CreateSeries(DataRow row);

        /// <summary>
        /// Create Image from datarow queried from database
        /// </summary>
        /// <param name="row"></param>
        /// <returns></returns>
        Image CreateImage(DataRow row);

        string GetSafeStringValue(object value);

        int GetSafeIntValue(object value);
    }
}