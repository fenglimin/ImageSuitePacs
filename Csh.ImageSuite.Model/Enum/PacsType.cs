namespace Csh.ImageSuite.Model.Enum
{
    public enum PacsType
    {
        MiniPacs,

        WebPacs
    }

    public enum StudyDateType
    {
        QueryAllDates = 0,
        QueryToday,
        QuerySinceYesterday,
        QueryLast7Days,
        QueryLast30Days,
        QueryLast6Months,
        QueryLast12Months,
        DATERANGE
    }

    /// <summary>
    /// ScanStatus in Study Table
    /// </summary>
    public enum ScanStatus
    {
        Canceled = 5,
        Scheduled = 10,
        Started = 20,
        Ended = 30,
        Completed = 40
    }

    public enum ReservedStatus
    {
        UnReserved = 0,
        Reserved = 1
    }
}
